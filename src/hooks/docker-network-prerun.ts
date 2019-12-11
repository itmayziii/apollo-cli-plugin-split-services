import { Hook } from '@oclif/config'
import Docker from 'dockerode'
import { dockerNetwork } from '../hook-fns/docker-network'
import { getGatewayApolloConfig } from '../helpers'
import * as parser from '@oclif/parser'

const dockerNetworkPrerun: Hook<'prerun'> = function dockerNetworkPrerunHook (options) {
  const parsedOutput = parser.parse(options.argv, options.Command)
  const apolloConfig = getGatewayApolloConfig(parsedOutput.flags.config)
  return dockerNetwork(options, apolloConfig, new Docker())
}

export default dockerNetworkPrerun
