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

This will be omitted from the following code examples as this can be different depending on which type of script you want to use.

### Simple configuration

The easiest script you can run is just a plain simple npm script, you could write whatever you want in this npm script, you could run prettier, linter, testing ... Let's just assume such a script exists and is called `test`, but you can replace this with any npm script. Then your pre-commit script could just look like this.

```
npm run lint
```

Or if you are using docker ember, the following:

```
edi npm run lint
```

If you are not sure if you have docker ember, you can check if you have it and then run the corresponding command.

```
if ! command -v ed &> /dev/null
then
  npm run lint
else
  edi npm run lint
fi
```

The advantages of using a configuration as above is that it is easy to setup, disadvantages are however that npm does not always error, sometimes errors are surpressed and are just printed as warnings, but the command will still exit with a status code 0. Which means you see you have errors, but your commit will still be executed.

### Complex configuration

If you want some custom configuration where you have more control over what you do, you can try one of the following configurations.

If you only want to check staged changes (also works with --patch), you can do something as follows, but this requires some research about which arguments you can supply to the command you want to run etc... this example just runs eslint on javascript files.

```
# Get the list of files added or modified in this commit
files=$(git diff --cached --name-only --diff-filter=ACM | grep "\.js$")

if [ ${#ffiles} -lt 1 ]; then
    echo -e "You have no staged .js files to test\n"
    exit
fi

PASS=true

for FILE in $files; do
  # Only staged changes are linted, disadvantage, all files need to be checked individually
  git show ":$FILE" | npx eslint --stdin --stdin-filename "$FILE" # we only want to lint the staged changes, not any un-staged changes
  if [ $? -ne 0 ]; then
    #echo "ESLint failed on staged file '$FILE'."
    PASS=false
  fi
done

if ! $PASS; then
  echo "COMMIT FAILED:Your commit contains files that should pass ESLint but do not. Please fix the ESLint errors and try again.\n"
  exit 1
else
  echo "COMMIT SUCCEEDED\n"
fi
```

Another configuration is the following, where you runt eslint on files that have been staged (does run on the whole file though, not just the staged changes). An advantage here is that you don't have to run eslint file by file. Again if you want to use this you should check which arguments you can supply to the commands you want to run.

```
# Get the list of files added or modified in this commit
files=$(git diff --cached --name-only --diff-filter=ACM | grep "\.js$")

if [ ${#files} -lt 1 ]; then
    echo -e "You have no staged .js files to test\n"
    exit
fi

npx eslint ${files[*]} "$@"
if [ $? -ne 0 ]; then
    echo -e "\nPlease fix the above linting issues before committing.\n"
    exit 1
fi
```

These two configurations should actually exit with a non-zero exit code if you have linter warnings, and prevent you from committing.

## Override

If you want to skip the hooks, you can commit with the `--no-verify` flag or abbreviated `-n`.
