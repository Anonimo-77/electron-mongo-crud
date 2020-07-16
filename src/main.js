const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const url = require('url');

const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/myMongoCRUD', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const Task = require('./models/Task');

let mainWindow;

app.on('ready', () => {
    mainWindow = new BrowserWindow({
        width: 750,
        height: 490,
        webPreferences: {
            nodeIntegration: true
        }
    });
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'views', 'index.html'),
        protocol: 'file',
        slashes: true
    }));
});

ipcMain.on('newTask', (e, taskinfo) => {
    if (taskinfo.updateStatus == false) {
        let { name, description } = taskinfo;

        let newTask = new Task({
            name: name,
            description: description
        });
        newTask.save();
        e.reply('created');
    }
    else {
        if (taskinfo.id) {
            Task.findOne({_id: taskinfo.id}, (err,doc) => {
                if (err) throw err;
                if (doc) {
                    doc.name = taskinfo.name;
                    doc.description = taskinfo.description;
                    doc.save();
                    setTimeout(() => {
                        e.reply('created');
                    }, 4000);
                }
            })
        }
    }
});

ipcMain.on('deleteTask', (e,taskName) => {


    Task.findOneAndDelete({name: taskName}, (err,doc) => {
        if (err) throw err;
        e.reply('deleted');
    })
})