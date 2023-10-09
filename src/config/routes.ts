export const AppRoutes = {
  '404': '/404',
  _offline: '/_offline',
  welcome: '/welcome',
  terms: 'https://oasisprotocol.org/terms-of-use',
  privacy: 'https://oasisprotocol.org/privacy-policy',
  licenses: '/licenses',
  index: '/',
  imprint: '/imprint',
  home: '/home',
  cookie: '/cookie',
  addressBook: '/address-book',
  addOwner: '/addOwner',
  apps: {
    open: '/apps/open',
    index: '/apps',
    custom: '/apps/custom',
    bookmarked: '/apps/bookmarked',
  },
  balances: {
    nfts: '/balances/nfts',
    index: '/balances',
  },
  newSafe: {
    load: '/new-safe/load',
    create: '/new-safe/create',
  },
  settings: {
    spendingLimits: '/settings/spending-limits',
    setup: '/settings/setup',
    notifications: '/settings/notifications',
    modules: '/settings/modules',
    index: '/settings',
    environmentVariables: '/settings/environment-variables',
    data: '/settings/data',
    cookies: '/settings/cookies',
    appearance: '/settings/appearance',
    safeApps: {
      index: '/settings/safe-apps',
    },
  },
  share: {
    safeApp: '/share/safe-app',
  },
  transactions: {
    tx: '/transactions/tx',
    queue: '/transactions/queue',
    messages: '/transactions/messages',
    index: '/transactions',
    history: '/transactions/history',
  },
}
