<script setup lang="ts"></script>
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
                <li class="group-title">General</li>
                <li>
                    <RouterLink to="/settings/#" class="sidebar-link">
                        Appearance
                    </RouterLink>
                </li>
                <li>
                    <RouterLink to="/settings/#" class="sidebar-link">
                        Report Templates
                    </RouterLink>
                </li>
                <li>
                    <RouterLink to="/settings/#" class="sidebar-link">
                        Tests
                    </RouterLink>
                </li>
                <li>
                    <RouterLink to="/settings/#" class="sidebar-link">
                        SMS
                    </RouterLink>
                </li>
                <li>
                    <RouterLink to="/settings/#" class="sidebar-link">
                        Printing
                    </RouterLink>
                </li>
                <li>
                    <RouterLink to="/settings/#" class="sidebar-link">
                        Charts
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
                    <RouterLink to="/settings/#" class="sidebar-link">
                        Notifications
                    </RouterLink>
                </li>
            </ul>
            <ul>
                <li class="group-title">Administrative</li>
                <li>
                    <RouterLink to="/settings/#" class="sidebar-link">
                        Manage Users
                    </RouterLink>
                </li>

                <li>
                    <RouterLink to="/settings/#" class="sidebar-link">
                        Advanced
                    </RouterLink>
                </li>
            </ul>
            <ul>
                <li>
                    <RouterLink to="/settings/#" class="sidebar-link">
                        About
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
.settings-page {
    padding: 50px;
}

.settings-page .back-link {
    color: var(--clr-black);
    text-decoration: none;
    padding: 3px 8px;
    border: 1px solid var(--clr-black);
    cursor: pointer;
    gap: 10px;
    font-size: var(-fs-base);
    width: max-content;
    font-weight: 500;
}

.settings-page .page-title {
    margin-top: 15px;
    font-weight: 500;
}

.settings-page .setting-links {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    padding: 50px;
    gap: 100px;
    max-width: 1300px;
    margin: auto;
}

.settings-page .setting-link {
    width: 220px;
    height: 200px;
    display: flex;
    flex-flow: column;
    justify-content: center;
    align-items: center;
    text-decoration: none;
    font-size: var(--fs-md);
    color: var(--clr-black);
    font-weight: 500;
    border: 1px solid;
}
.settings-page .setting-link img {
    height: 48px;
    width: 48px;
    object-fit: contain;
    margin-bottom: 20px;
}

.settings-layout {
    display: flex;
    height: 100%;
    width: 100%;
}

.settings-layout .sidebar {
    margin: 0;
    padding: 0;
    background: var(--clr-white);
    width: 330px;
    font-weight: 500;
    padding: 30px 20px;
}

.settings-layout .sidebar .sidebar-top {
    text-decoration: none;
    color: var(--clr-black);
    font-size: var(--fs-xl);
    padding: 0 10px;
    gap: 30px;
}

.settings-layout .sidebar ul {
    margin: 0;
    padding: 0;
    border-bottom: 1px solid var(--clr-black);
}
.settings-layout .sidebar li {
    list-style-type: none;
    border-bottom: 1px solid var(--clr-white);
}

.settings-layout .sidebar-link {
    display: block;
    text-decoration: none;
    color: var(--clr-black);
    padding: 5px 10px;
    font-size: var(--fs-md);
}
.settings-layout .sidebar .group-title {
    opacity: 0.9;
    padding: 0 10px;
    padding-top: 10px;
    font-weight: lighter;
}
.settings-layout .sidebar-link.router-link-exact-active {
    background: var(--clr-black);
    color: var(--clr-white);
}

.settings-layout .setting-page-area {
    padding: 30px;
    padding-top: 90px;
    flex-grow: 1;
}
</style>
