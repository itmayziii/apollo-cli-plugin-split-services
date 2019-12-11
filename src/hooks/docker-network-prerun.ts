import { Hook } from '@oclif/config'
import Docker from 'dockerode'
import { dockerNetwork } from '../hook-fns/docker-network'
import { getGatewayApolloConfig } from '../helpers'
import * as parser from '@oclif/parser'
import { ApolloConfig, GatewayConfig } from '../interfaces/apollo-config'

const dockerNetworkPrerun: Hook<'prerun'> = function dockerNetworkPrerunHook (options) {
  const parsedOutput = parser.parse(options.argv, options.Command)
  let apolloConfig: ApolloConfig<GatewayConfig>
  try {
    apolloConfig = getGatewayApolloConfig(parsedOutput.flags.config || 'apollo.config.js')
  } catch (e) {
    // We really don't care do anything if there is no apollo config.
    return
  }

  return dockerNetwork(options, apolloConfig, new Docker())
}

export default dockerNetworkPrerun
