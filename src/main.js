import chalk from "chalk";
import fs from 'fs';
import ncp from "ncp";
import path from "path";
import { promisify } from "util";
import execa from "execa";
import Listr from "listr";
import { projectInstall } from "pkg-install";


const access = promisify(fs.access);
const copy = promisify(ncp);

const copyTemplateFiles = async (options) => {
    return copy(options.templateDirectory, options.targetDirectory, {
        clobber: false
    });
}

const initGit = async (options) => {
    const reuslt = await execa('git', ['init'], {
        cwd: options.targetDirectory
    })
    if(reuslt.failed) {
        return Promise.reject(new Error('Failed to initialize Git'))
    }
    return
}

export const createProject = async (options) => {
    options = {
        ...options,
        targetDirectory: options.targetDirectory || process.cwd(),
    }

    const currentFileUrl = import.meta.url;
    const templateDir = path.resolve(
        new URL(currentFileUrl).pathname,
        '../../templates',
        options.template.toLowerCase()
    );

    options.templateDirectory = templateDir;

    try {
        await access(templateDir, fs.constants.R_OK);
    } catch (err) {
        console.error('%s Invalid template name', chalk.red.bold('ERROR'));
        process.exit(1);
    }

    // console.log('Copy project files');
    // await copyTemplateFiles(options);

    const tasks = new Listr([
        {
            title: 'Copy project files',
            task: () => copyTemplateFiles(options)
        },
        {
            title: 'Initialize git',
            task: () => initGit(options),
            enabled: () => options.git
        },
        {
            title: 'Install dependencies',
            task: () => projectInstall({
                cwd: options.targetDirectory
            }),
            skip: () => !options.runInstall ? 'Pass --install to automatically install the dependencies' : undefined
        }
    ])

    await tasks.run() 

    console.log('%s Project ready', chalk.green.bold('DONE'));
    return true;
}