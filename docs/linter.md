# Linter and prettier setup

In this readme more info can be found about the linter and prettier setup. In total two different linters are used one for the javascript code [eslint](#javascript-files) and one for the [handlebar files](#handlebar-files). [Prettier](#prettier) handles multiple file types.

## Linter

### Javascript files

Javascript files are verified with [ESlint](https://eslint.org/). Configuration is written in an `.eslintrc.js` file and files and directories to be ignored are described in `.eslintignore`. There is a lot that can be configured in the configuration file. Most settings are left to the defaults or come standard with an ember project. The only real updates here should happen to the rules section.

A few different plugins are used to handle the styling of this specific project. By default the recommended configuration of eslint is used, but because this is an ember project, this is extended with an [eslint-ember-plugin](https://github.com/ember-cli/eslint-plugin-ember). For test files [eslint-plugin-qunit](https://github.com/platinumazure/eslint-plugin-qunit) is used. For specific rules regarding Node.js [eslint-plugin-n](https://github.com/eslint-community/eslint-plugin-n#readme) is configured as well. These plugins come with ember by default.

Two extra plugins are used for integrating eslint with prettier. [eslint-config-prettier](https://github.com/prettier/eslint-config-prettier) disables all rules in eslint, that might conflicht with prettier settings. [eslint-plugin-prettier](https://github.com/prettier/eslint-plugin-prettier) is used to run prettier as if it were eslint rules. Both these plugins are configured by using `'plugin:prettier/recommended'` in the extends property.

### Handlebar files

Handlebar files are verified with [ember-template-lint](https://github.com/ember-template-lint/ember-template-lint). Configuration is written in a `.template-lintrc.js` file, and works very similar to the configuration of ESlint. In the configuration file, you can extend some provided set of rules, add additional rules, add plugins, override rules in specific cases and ignore files or directories.

Currently the recommended settings are followed with some simple overrides in case of test files.

Most rules will generate warnings or errors when you run the linter, some rules have fixers which allow automatic reformatting, additional fixers can also be added, see the [documentation](https://github.com/ember-template-lint/ember-template-lint/blob/master/docs/fixer.md) for this.

One plugin is installed, this is the [ember-template-plugin-prettier](https://github.com/ember-template-lint/ember-template-lint-plugin-prettier), this plugin runs prettier as linter rules. This way, you don't have to run prettier independently of the linter. This does mean that the pipeline will automatically fail for prettier issues as well.

### Usage

It's important to know that linters can be used in different places. The main usage is that these settings are checked in the pipeline when opening a PR to master. Because of this it is advised to check these rules before you commit. There are two main ways of handling this:

1. You manually run the linter command before you commit. These commands are configured in the package.json file.

   E.g. you can use the following commands to run the linter:

   ```
   npm run lint # Runs both the javascript and template linter
   npm run lint:js # Runs the javascript linter
   npm run lint:hbs # Runs the template linter
   ```

   You can also append `:fix` to any of these commands to try to fix existing errors.

2. This can be ran automatically as well. This is not trivial however and is still in the process of being looked into. More info about this will be documented [here](#automation).

## Prettier

Prettier is a code formatter which removes all original styling and ensures that all outputted code conforms to a consistent style.

Prettier has support for a wide range of languages and is very configurable. More info can be found [here](https://prettier.io/).

The reason we use prettier is to alleviate part of a linters tasks. Linter rules can be categorised in two groups. The first group focusses on code quality and checks stuff like unused variables etc. The second group is regarding formatting, such as max length, double or single quote etc. Prettier can take over these last kind of rules and fix these automatically.

A few important key takeaways are the following:

- Prettier is configured in `.prettierrc.js`, this can also be configured in other kind of files with different precedence, but the `.prettierrc.js` is the file type we use.
- A `.editorconfig` file also exists in this repo, these settings are imported in prettier. Some of these settings are not configurable in prettier, others are, if the prettier redefines these, the editorconfig property is overwritten.
- `.prettierignore` defines directories and files that are ignored by prettier.
- Sometimes linter rules can conflict with prettier rules, this requires some precaution and can cause confusion. It is best to leave styling rules to prettier and remove these from the linter, however an extra plugin can be used to prevent conflicts `eslint-config-prettier` removes linter rules that can possible conflict.

### Basic configuration

The options available in prettier can be found [here](https://prettier.io/docs/en/options).

Prettier can define global rules, that are applicable in all files, it can however also define overrides for a specific kind of file. In commonJS a global config would look like this:

```
const config = {
  singleQuote: true,
};

module.exports = config;

```

A global config with an override for javascript files would look like this:

```
const config = {
  singleQuote: false,
  overrides: [
    {
      files: '*.{js,ts}',
      options: {
        singleQuote: true,
      },
    },
  ],
};

module.exports = config;

```

### Usage

Similar to the linter, prettier can also be used in different ways:

1. You can manually execute prettier.
   Two commands are useful here:
   
   ```
   npx prettier . --check
   ```
   
   This command checks whether there are problems in any of your files for which the prettier is configured. Instead of using the . you can also specify a directory or file to check.
   
   ```
   npx prettier . --write
   ```
   
   This command will try to fix all warnings thrown by prettier and write these to file.

2. The prettier can also run automatically if you define them in your editor settings, however the instructions below only format when you save a file (all other files will remain untouched). In VS Code this can be done with a [plugin](https://github.com/prettier/prettier-vscode), more information can be found in the provided link. In short this can be activated by adding some config in your `user.settings` file. Be careful, you can have a global `user.settings` file, but you can also have a workspace specific file, which overwrites the global user settings. 
   To set which formatter you want to use you add the following piece of code javascript files:
   
   ```
   "[javascript]": {
      "editor.defaultFormatter": "esbenp.prettier-vscode",
    },
   ```
   
   This will automatically run the prettier with the settings defined in `.prettierrc.js` for the specified file type, in this case for javascript files. Since we work with ember we also want some formatting for the handlebar files. This can be done by adding the following:
   
   ```
   "[handlebars]": {
      "editor.defaultFormatter": "esbenp.prettier-vscode",
   },
   ```
   
   This can be done for any file type.
   
   Disclaimer: if you use the [Glimmer Templates Syntax for VS Code plugin](https://marketplace.visualstudio.com/items?itemName=lifeart.vscode-glimmer-syntax), this might influence your templates as well, but the interaction between both is not entirely clear.
   
   To automatically run formatting (prettier) on save you can add the following line:
   
   ```
   "editor.formatOnSave": true,
   ```
   
   Either you add this globally or in the settings of a specific type of file, see above.

## Automation

It is also possible to add git hooks which would run the linter and prettier before you are able to commit. This is not supported as of now. It is still under review how we want to do this, either with a bash script which is ran as a git commit hook or with a dedicated plugin which is added to the repo. Once this is finalised, more info will be added here.

## Extra

Next to running linters and prettiers on javascript and template files it is also possible to run these on css files. Since css is only a small part of this repo and at the time of writing this, it didn't really make sense to include this, there is no support for running a linter or prettier on css files. If however at a later stage this would become useful, [stylelint](https://stylelint.io/) and [stylelint-prettier](https://github.com/prettier/stylelint-prettier) are good places to start.
