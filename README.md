# Create Gasket App Testing

This is a utility to test the create-gasket-app CLI.

## Getting Started

```sh
git clone <repo>
cd <repo>
npm install
```

## Usage

```sh
npm run start // or node src/index.js
```
![scripts](./static/script.png)

## Apps

Apps are created in the `__apps__` directory.

## Local Presets

Create a `.env` file in the root of the project with the following:

```sh
# open source
OS_PRESET_NEXTJS=<path>
OS_PRESET_API=path

# internal
INTERNAL_PRESET_WEBAPP=<path>
INTERNAL_PRESET_API=<path>
INTERNAL_PRESET_HCS=<path>
INTERNAL_REGISTRY=<private-registry>

# Skip local package prompt
USE_LOCAL=1

# Build the apps post create
RUN_BUILD=1
```

## Internal Presets

The internal preset options will be available when the proper environment variables are set. Currently there is only local package(preset-path) support for internal presets.

## Reports

All reports on untracked and they are in progress. Reports are populated after running the utility. Errors are captured and the stack trace is printed to the `error` property of the app type.

- [x] `report.create.json` - create-gasket-app report
- [x] `report.build.json` - Build command
- [ ] `report.files.json` - Generated file validation report
- [ ] `report.render.json` - General render success or failure
- [ ] `report.test.json` - Test npm command
- [ ] `report.start.json` - Start npm command
- [ ] `report.local.json` - Local npm command
- [ ] `report.preivew.json` - Preview npm command
- [ ] `report.lint.json` - Lint npm command

<img src='./static/reports.png' width='75%'/>

## Scripts

- `npm run start` - Start the utility
- `npm run build` - Build the apps
- `npm run report` - Print the report results
- `npm run clean:apps` - delete the `__apps__` directory
- `npm run clean:files` - delete all files but leave `node_modules`(performance reasons)
- `npm run clean:next` - delete the `.next` directory in all the apps

## Todo

- [x] Internal Presets
- [ ] NPM Registry support
- [ ] Clean up and document
- [ ] Automate render testing
- [ ] Automate NPM script testing
- [ ] Implement file validation
