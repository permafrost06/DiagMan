import { getLibsqlClient } from '../db/conn';
import { RequestHandler } from '../router';
const getFirstDay = (year: number, month: number): number => {
	const dateStr = `${year}-${String(month).padStart(2, '0')}-01`;
	return new Date(dateStr).getTime();
};

const getLastDay = (year: number, month: number): number => {
	const lastDay = new Date(year, month, 0).getDate();
	const dateStr = `${year}-${String(month).padStart(2, '0')}-${lastDay}`;
	return new Date(dateStr).getTime();
};

const getDateRange = (url: string) => {
	const search = new URL(url).searchParams;
	const from = search.get('from');
	const to = search.get('to');
	const today = new Date();

	let fromMonth: number;
	let fromYear: number;

	let toMonth: number;
	let toYear: number;

	if (!from || !/^\d{4}-\d{1,2}$/.test(from)) {
		fromMonth = today.getMonth() + 1;
		fromYear = today.getFullYear();
	} else {
		[fromYear, fromMonth] = from.split('-').map(Number);
	}

	if (!to || !/^\d{4}-\d{1,2}$/.test(to)) {
		toMonth = fromMonth;
		toYear = fromYear;
	} else {
		[toYear, toMonth] = to.split('-').map(Number);
	}

	const diff = toMonth - fromMonth;

	let prevFromYear = fromYear;
	let prevToYear = fromYear;
	let prevToMonth = fromMonth - 1;
	let prevFromMonth = prevToMonth - diff;
	if (prevToMonth < 1) {
		prevToYear--;
		prevToMonth += 12;
	}
	if (prevFromMonth < 1) {
		prevFromYear--;
		prevFromMonth += 12;
	}

	return {
		from: getFirstDay(fromYear, fromMonth),
		to: getLastDay(toYear, toMonth),
		prevFrom: getFirstDay(prevFromYear, prevFromMonth),
		prevTo: getLastDay(prevToYear, prevToMonth),
	};
};

type DateRange = ReturnType<typeof getDateRange>;

const getSaleData = async (db: ReturnType<typeof getLibsqlClient>, { from, to, prevFrom, prevTo }: DateRange) => {
	const sql = `
	SELECT
  	  SUM(total) AS total_sum,
  	  SUM(discount) AS discount_sum
	FROM patients
	WHERE timestamp BETWEEN ? AND ?
	`;
	const { rows } = await db.execute({
		sql,
		args: [from, to],
	});

	const { rows: prevSum } = await db.execute({
		sql,
		args: [prevFrom, prevTo],
	});

	const monthly_avg_sql = `
		WITH monthly_totals AS (
		    SELECT
		        strftime('%Y-%m', datetime(timestamp/1000, 'unixepoch')) AS month,
		        type,
		        SUM(total) AS total_sum,
		        SUM(discount) AS discount_sum
		    FROM patients
				WHERE timestamp NOT NULL
		    GROUP BY month
		)
		SELECT
		    AVG(total_sum) AS monthly_avg_total,
		    AVG(discount_sum) AS monthly_avg_discount
		FROM monthly_totals
	`;
	const { rows: monthly_avg_rows } = await db.execute(monthly_avg_sql);

	return {
		revenue: {
			total: rows[0].total_sum || 0,
			last: prevSum[0].total_sum || 0,
			avg: monthly_avg_rows[0].monthly_avg_total || 0,
		},
		discount: {
			total: rows[0].discount_sum || 0,
			last: prevSum[0].discount_sum || 0,
			avg: monthly_avg_rows[0].monthly_avg_discount || 0,
		},
	};
};

export const getFinances: RequestHandler = async ({ env, res, url }) => {
	const db = getLibsqlClient(env);

	const dateRange = getDateRange(url);
	const saleData = await getSaleData(db, dateRange);

	const saleByTestSql = `
	WITH tests AS (
	  SELECT
	    patients.id AS patient_id,
	    json_extract(value, '$.name') AS name,
	    CAST(json_extract(value, '$.price') AS REAL) AS price,
	    patients.timestamp
	  FROM patients, json_each(patients.tests)
	)
	SELECT
	  name,
	  SUM(price) AS amount
	FROM tests
	WHERE timestamp BETWEEN ? AND ?
	GROUP BY name
	ORDER BY amount DESC LIMIT 8
	`;

	const { rows } = await db.execute({
		sql: saleByTestSql,
		args: [dateRange.from, dateRange.to],
	});

	const barChartSql = `
	WITH WeeklyEntries AS (
    SELECT
      type,
      date(datetime(timestamp / 1000, 'unixepoch'), 'weekday 0', '-6 days') AS week_start,
      SUM(total) AS total_sum,
      MIN(timestamp) AS min_timestamp
    FROM patients
    GROUP BY type, week_start
  ),
  DistinctWeeks AS (
    SELECT DISTINCT week_start, MIN(min_timestamp) AS min_timestamp
    FROM WeeklyEntries
    GROUP BY week_start
  ),
  RankedWeeks AS (
    SELECT
      week_start,
      min_timestamp,
      CASE
        WHEN min_timestamp BETWEEN ? AND ? THEN 0
        ELSE MIN(ABS(min_timestamp - ?), ABS(min_timestamp - ?))
      END AS distance
    FROM DistinctWeeks
    ORDER BY distance ASC, week_start ASC
    LIMIT 16
  )
  SELECT we.*
  FROM WeeklyEntries we
  JOIN RankedWeeks rw ON we.week_start = rw.week_start
  ORDER BY we.week_start ASC;
	`;

	const { rows: barChartRows } = await db.execute({
		sql: barChartSql,
		args: [dateRange.from, dateRange.to, dateRange.from, dateRange.to],
	});

	res.setData({
		revenue: saleData.revenue,
		discount: saleData.discount,
		tests: rows,
		barChart: barChartRows,
	});
};
