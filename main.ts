const file = Deno.args.at(0) || './package.json'

const decoder = new TextDecoder('utf-8')
const fileContents = await Deno.readFile(file)

const json = JSON.parse(decoder.decode(fileContents))

const deps = Object.keys(json.dependencies ?? {})

if (deps.length) {
  await runCommand('npm', 'i', ...deps.map((d) => `${d}@latest`))
}

const devDeps = Object.keys(json.devDependencies ?? {})

if (devDeps.length) {
  await runCommand('npm', 'i', '-D', ...devDeps.map((d) => `${d}@latest`))
}

async function runCommand(cmdName: string, ...args: string[]) {
  const cmd = new Deno.Command(cmdName, { args })

  const { stdout, stderr, ...result } = await cmd.output()

  console.log(new TextDecoder('utf-8').decode(stdout))
  console.log(new TextDecoder('utf-8').decode(stderr))

  if (!result.success) {
    console.error(
      `${cmdName} ${args.join(' ')} failed:\n`,
      result.code,
      result.signal,
    )

    Deno.exit(result.code)
  }
}
