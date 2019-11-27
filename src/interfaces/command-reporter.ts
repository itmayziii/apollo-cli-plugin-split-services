import { Command } from '@oclif/command'

/**
 * Commands usually available through oclif to log to the console or exit the CLI.
 */
export interface CommandReporter {
  exit: typeof Command.prototype.exit
  warn: typeof Command.prototype.warn
  error: typeof Command.prototype.error
  log: typeof Command.prototype.log
}
