const gatewayValidConfig = {
  splitServices: {
    services: [
      {
        name: 'Orders',
        gitURL: 'https://github.com/BudgetDumpster/orders',
        directory: 'orders'
      }
    ]
  }
}

module.exports = gatewayValidConfig
