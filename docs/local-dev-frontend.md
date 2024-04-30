# frontend dev

前端架构:
- react
- patternfly

## build
打包逻辑：
- yarn run build
  - yarn clean
  - yarn generate(编译 plugin sdk)
    - yarn generate-graphql(`graphql-codegen --config graphql-codegen.yml`)
    - yarn build-plugin-sdk(`yarn --cwd packages/console-dynamic-plugin-sdk build`)
      - yarn clean && yarn validate && yarn compile && yarn generate
    - yarn build-console-plugin-shared(`yarn --cwd packages/console-plugin-shared build`)
  - yarn ts-node ./node_modules/.bin/webpack(编译主包)

优化：
- type check
- SWC

## entrypoint

## console extensions
console 插件：
- static plugin(`package.json.consolePlugin.entry`)
- dynamic plugin(`console-extensions.json`)


- 核心模块`@console/app`,项目工程[位于](../frontend/packages/console-app)

