const gatewayValidConfig = {
  splitServices: {
    services: [
      {
        name: 'Orders',
        gitURL: 'https://github.com/BudgetDumpster/orders',
        directory: 'services/orders'
      }
    ]
  }
}

module.exports = gatewayValidConfig
