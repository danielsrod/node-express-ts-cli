import arg from 'arg';
import inquirer from 'inquirer';
import { createProject } from './main';

const parseArgumentsIntoOptions = (rawArgs) => {
    const args = arg(
        {
            '--git': Boolean,
            '--yes': Boolean,
            '--install': Boolean,
            '-g': '--git',
            '-y': '--yes',
            '-i': '--install',
        },
        {
            argv: rawArgs.slice(2),
        }
    );
    return {
        skipPrompts: args['--yes'] || false,
        git: args['--git'] || false,
        template: args._[0],
        runInstall: args['--install'] || false
    }
}

const promptForMissingOptinos = async (options) => {
    const defaultTemplate = 'TypeScript';
    if(options.skipPrompts) {
        return {
            ...options,
            template: options.template || defaultTemplate
        }
    }

    const questions = [];
    if(!options.template) {
        questions.push({
            type: 'list',
            name: 'template',
            message: 'Please choose which tempalte to use',
            choices: ['TypeScript', 'JavaScript'],
        })
    }
    
    if(!options.git) {
        questions.push({
            type: 'confirm',
            name: 'git',
            message: 'Initialize a git repo?',
            default: false,
        })
    }

    const answers = await inquirer.prompt(questions);

    return {
        ...options,
        template: options.template || answers.template,
        git: options.git || answers.git,
    }

}

export const cli = async (args) => {
    let options = parseArgumentsIntoOptions(args)
    options = await promptForMissingOptinos(options);
    await createProject(options)
}