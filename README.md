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
npm run start // or node index.js
```
![scripts](./static/script.png)

## Apps

Apps are created in the `__apps__` directory.

## Local Presets

Create a `.env` file in the root of the project with the following:

```sh
NEXTJS_PRESET_PATH=path
API_PRESET_PATH=path
BUILD_APPS=1 # Build the apps post create
```

