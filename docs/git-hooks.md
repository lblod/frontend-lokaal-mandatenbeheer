# Git hooks

What are git hooks? Git hooks are custom scripts that can be configured to fire when a specific action occurs, see [git documentation](https://git-scm.com/docs/githooks) for more information. There are a lot of cases in which git hooks could come handy, in this case however we are only interested in one specific hook and this is the pre-commit hook. This hook is triggered before you try to commit, if this script exits with a non-zero status code, the commit is aborted, if the script returns a 0 exit code, the commit will be executed.
There is also the possibility to use npm plugins such as [husky plugin](https://typicode.github.io/husky/) to streamline this process and configure this globally. However it was decided not to do this to keep configuration in line with other lblod projects.

## Usage

The usage of a git hook is pretty straightforward. You just go to the .git/hooks folder where you will find a lot of sample files. These files contain an example of how such a hook could look like. You just remove the .sample extension and you have a working git hook.

## Configuration

Preferably we would like to run a custom script whenever we try to commit. In this section a few examples of what such a script could look like are given. First of all you need to define which kind of script you are using, in my case this is a bash script, so my file starts with the following line:

```
#!bin/bash
```

## Simple configuration

This will be omitted from the following code examples as this can be different depending on which type of script you want to use.

The easiest script you can run is just a plain simple npm script, you could write whatever you want in this npm script, you could run prettier, linter, testing ... Let's just assume such a script exists and is called `test`, but you can replace this with any npm script. Then your pre-commit script could just look like this.

```
npm run lint
```

Or if you are using docker ember, the following:

```
edi npm run lint
```

test 123

## Complex configuration
