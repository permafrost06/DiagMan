import type { AppContext, ExtractPropTypes, Ref, VNode } from "vue";
import { createVNode, isVNode, render } from "vue";
import NotificationConstructor from "./Notification.vue";

export const notificationTypes = [
    "success",
    "info",
    "warning",
    "error",
] as const;

type NotificationPosition =
    | "top-left"
    | "top-right"
    | "bottom-left"
    | "bottom-right";

interface NotificationOptions {
    position: NotificationPosition;
    type: (typeof notificationTypes)[number];
    title: string;
    message: string;
    offset: number;
    onClose: () => void;
    appendTo: string | HTMLElement;
    duration: number;
    dangerouslyUseHTMLString: boolean;
}

export type NotificationProps = ExtractPropTypes<NotificationOptions>;

interface NotificationHandle {
    close: () => void;
}

export type NotificationOptionsTyped = Omit<NotificationOptions, "type">;

type NotificationParams = Partial<NotificationOptions> | string | VNode;
export type NotificationParamsTyped =
    | Partial<NotificationOptionsTyped>
    | string
    | VNode;
type NotifyFn = ((options?: NotificationParams) => NotificationHandle) & {
    closeAll: () => void;
};

interface NotificationQueueItem {
    vm: VNode;
}

type NotificationQueue = NotificationQueueItem[];

type NotifyTypedFn = (options?: NotificationParamsTyped) => NotificationHandle;
interface Notify extends NotifyFn {
    success: NotifyTypedFn;
    warning: NotifyTypedFn;
    error: NotifyTypedFn;
    info: NotifyTypedFn;
}

const notifications: Record<NotificationPosition, NotificationQueue> = {
    "top-left": [],
    "top-right": [],
    "bottom-left": [],
    "bottom-right": [],
};

const GAP_SIZE = 16;
let seed = 1;

const isElement = (e: unknown): e is Element => {
    if (typeof Element === "undefined") return false;
    return e instanceof Element;
};

// @ts-ignore
const notify: Notify & { _context: AppContext | null } = function (
    options = {},
    context: AppContext | null = null
) {
    if (typeof options === "string" || isVNode(options)) {
        options = { message: options } as Partial<NotificationOptions>;
    }

    const position: NotificationPosition = options.position || "top-right";

    let verticalOffset = options.offset || 0;
    notifications[position].forEach(({ vm }) => {
        verticalOffset += (vm.el?.offsetHeight || 0) + GAP_SIZE;
    });
    verticalOffset += GAP_SIZE;

    const id = `notification_${seed++}`;
    const userOnClose = options.onClose;
    const props: Partial<NotificationProps> = {
        ...options,
        offset: verticalOffset,
        id,
        // @ts-ignore
        onClose: () => {
            close(id, position, userOnClose);
        },
    };

    let appendTo: HTMLElement | null = document.body;
    if (isElement(options.appendTo)) {
        appendTo = options.appendTo;
    } else if (typeof options.appendTo === "string") {
        appendTo = document.querySelector(options.appendTo);
    }

    if (!isElement(appendTo)) {
        appendTo = document.body;
    }

    const container = document.createElement("div");

    const vm = createVNode(
        NotificationConstructor,
        props,
        isVNode(props.message)
            ? {
                  default: () => props.message,
              }
            : null
    );
    vm.appContext = context ?? notify._context;

    vm.props!.onDestroy = () => {
        render(null, container);
    };

    render(vm, container);
    notifications[position].push({ vm });
    appendTo.appendChild(container.firstElementChild!);

    return {
        close: () => {
            (vm.component!.exposed as { visible: Ref<boolean> }).visible.value =
                false;
        },
    };
};
notificationTypes.forEach((type) => {
    notify[type] = (options = {}) => {
        if (typeof options === "string" || isVNode(options)) {
            options = {
                message: options as any,
            };
        }
        return notify({
            ...options,
            type,
        });
    };
});


export function close(
    id: string,
    position: NotificationPosition,
    userOnClose?: (vm: VNode) => void
): void {
    console.log("Closing: ", id);
    
    const orientedNotifications = notifications[position];
    const idx = orientedNotifications.findIndex(
        ({ vm }) => vm.component?.props.id === id
    );
    if (idx === -1) return;
    const { vm } = orientedNotifications[idx];
    if (!vm) return;
    userOnClose?.(vm);

    const removedHeight = vm.el!.offsetHeight;
    const verticalPos = position.split("-")[0];
    orientedNotifications.splice(idx, 1);
    const len = orientedNotifications.length;
    
    if (len < 1) return;
    for (let i = idx; i < len; i++) {
        const { el, component } = orientedNotifications[i].vm;
        const pos =
            Number.parseInt(el!.style[verticalPos], 10) -
            removedHeight -
            GAP_SIZE;
        component!.props.offset = pos;
    }
}

export function closeAll(): void {
    for (const orientedNotifications of Object.values(notifications)) {
        orientedNotifications.forEach(({ vm }) => {
            (vm.component!.exposed as { visible: Ref<boolean> }).visible.value =
                false;
        });
    }
}

notify.closeAll = closeAll;
notify._context = null;

export default notify;
