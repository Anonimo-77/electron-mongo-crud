const { ipcRenderer } = require('electron');

const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/myMongoCRUD', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const Task = require('../models/Task');
var updatingTask;



var updateStatus = false;

function showAll() {
    Task.find({}, (err,alltasksb) => {
        if (err) throw err;
        if (alltasksb) {
            let alltasks = [];

            for (i = 0;i < alltasksb.length; i++) {
                obj = {
                    _id: alltasksb[i]._id.toString(),
                    name: alltasksb[i].name,
                    description: alltasksb[i].description
                };
                alltasks.push(obj);
            }
            list = "";
            for (i=0;i<alltasks.length;i++) {

                list += `<li><b>${alltasks[i].name}: </b><label style="color: gray;">${alltasks[i].description}</label><button style="border-radius:0;background:none;border:none;" onclick="updateTask('${alltasks[i]._id}')"><img src="edit.png"></button><button style="border-radius:0;background:none;border:none;" onclick="deleteTask('${alltasks[i].name}')"><img src="delete.png"></button></li>`;
            
            }
            
            document.getElementById('taskList').innerHTML = list;
        
        }
    });

}
document.getElementById('form').onsubmit = (e) => {
    if (updateStatus == false) {
        e.preventDefault();
        let name = document.getElementById('name').value;
        let description = document.getElementById('description').value;

        ipcRenderer.send('newTask', {name:name,description:description,updateStatus:updateStatus});

        ipcRenderer.on('created', () => {
            alert('Task created successfully!');
            setTimeout(() => {
                showAll();
                document.getElementById('form').reset();
            },500);


        });
    } else {
        e.preventDefault();
        let name = document.getElementById('name').value;
        let description = document.getElementById('description').value;
        Task.findById(updatingTask, (err,doc) => {
            if (err) throw err;
            if (doc) {
                doc.name = name;
                doc.description = description;
                doc.save();
                alert('Task updated successfully!');
                updatingTask = undefined;
                setTimeout(() => {
                    showAll();
                    document.getElementById('form').reset();
                },500);
            }
        });
    }
}

function deleteTask(taskName) {

    ipcRenderer.send('deleteTask', taskName);
    ipcRenderer.on('deleted', () => {
        alert('Task Deleted Successfully!');
        setTimeout(() => {
            showAll();
        }, 500);
    });

}
function updateTask(taskId) {
    updateStatus = true;
    Task.findOne({_id: taskId}, (err, thatTask) => {
        if (err) throw err;
        if (thatTask) {
            updatingTask = taskId;
            document.getElementById('name').value = thatTask.name;
            document.getElementById('description').value = thatTask.description;
        }
    });
}
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        showAll();
    }, 500);
})