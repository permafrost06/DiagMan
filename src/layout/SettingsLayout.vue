<template>
    <div class="settings-layout">
        <nav class="sidebar font-h">
            <RouterLink
                :to="{ name: 'settings' }"
                class="sidebar-top flex items-center"
            >
                Settings
            </RouterLink>
            <ul>
                <li>
                    <RouterLink
                        :to="{ name: 'settings.patient-list' }"
                        class="sidebar-link"
                    >
                        Patient List
                    </RouterLink>
                </li>
                <li>
                    <RouterLink
                        :to="{ name: 'settings.report-templates' }"
                        class="sidebar-link"
                    >
                        Report Templates
                    </RouterLink>
                </li>
                <li>
                    <RouterLink
                        :to="{ name: 'settings.account' }"
                        class="sidebar-link"
                    >
                        Account
                    </RouterLink>
                </li>
                <li>
                    <RouterLink
                        :to="{ name: 'settings.sms' }"
                        class="sidebar-link"
                    >
                        SMS
                    </RouterLink>
                </li>
            </ul>
        </nav>
        <div class="setting-page-area">
            <RouterView></RouterView>
        </div>
    </div>
</template>

<style lang="scss">
.settings-layout {
    display: flex;
    height: 100%;
    width: 100%;

    .sidebar {
        margin: 0;
        padding: 0;
        background: var(--clr-white);
        width: 330px;
        font-weight: 500;
        padding: 30px 20px;
    }

    .sidebar .sidebar-top {
        text-decoration: none;
        color: var(--clr-black);
        font-size: var(--fs-xl);
        padding: 0 10px;
        gap: 30px;
    }

    .sidebar ul {
        margin: 0;
        padding: 0;
        border-bottom: 1px solid var(--clr-black);
    }
    .sidebar li {
        list-style-type: none;
        border-bottom: 1px solid var(--clr-white);
    }

    .sidebar-link {
        display: block;
        text-decoration: none;
        color: var(--clr-black);
        padding: 5px 10px;
        font-size: var(--fs-md);
    }
    .sidebar .group-title {
        opacity: 0.9;
        padding: 0 10px;
        padding-top: 10px;
        font-weight: lighter;
    }
    .sidebar-link.router-link-exact-active {
        background: var(--clr-black);
        color: var(--clr-white);
    }

    .setting-page-area {
        padding: 30px;
        padding-right: 50px;
        flex-grow: 1;
        overflow-y: auto;
    }
}
</style>
