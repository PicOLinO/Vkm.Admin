﻿var jstreeSelectedItemId = -1;


$(function () {
    $("#BaseTree").jstree(
        {
            "core": {
                check_callback: true,
                multiple: false
            },
            "types": {
                "team": {
                    "icon": "fas fa-users",
                    "valid_children": ["student"]
                },
                "student": {
                    "icon": "fas fa-user",
                    "valid_children": "none"
                }
            },
            "conditionalselect": function (node) {
                return node.type !== "team";
            },
            "contextmenu": {
                items: treeContextMenu
            },
            "plugins": ["conditionalselect", "sort", "wholerow", "unique", "types", "contextmenu"]
        }
    );
});

function treeContextMenu(node) {

    var items = {
        add: {
            label: "Добавить",
            action: function() {
                //TODO:
            }
        },
        remove: {
            label: "Удалить",
            action: function () {
                if (confirm("Удалить студента?")) {
                    $.ajax({
                        url: "Home/RemoveStudent",
                        data: {id: node.data.jstree.id},
                        success: function() {
                            var nodeId = $("#BaseTree").jstree().get_selected()[0];
                            var nodeForDelete = $("#BaseTree").jstree().get_node(nodeId);
                            $("#BaseTree").jstree().delete_node(nodeForDelete);
                        },
                        statusCode: {
                            500: function (content) { alert("Необработанная ошибка на сервере. Обратитесь к разрабочтику \n\nТекст ошибки: " + content.responseText); }
                        },
                        error: function (req, status, errorObj) {
                            // handle status === "timeout"
                            // handle other errors
                        }
                    })
                }
            }
        },
        update: {
            label: "Изменить",
            action: function (data) {
                var parameter = {id: jstreeSelectedItemId};
                $.getJSON("/Home/Student", parameter, onStudentLoadedFromJsTreeEditClicked);
                $('#EditStudentDialog').modal('show');
            }
        }
    };

    if (node.type === "student") {
        delete items.add;
    }

    return items;
}

$("#BaseTree")
    .on("changed.jstree", function (e, data) {
        jstreeSelectedItemId = data.node.data.jstree.id;
        var parameter = {id: jstreeSelectedItemId};
        $.getJSON("/Home/Student", parameter, onStudentLoadedFromJsTreeChanged);
    });

$('#m_SaveButton').click(function () {
    var student = {
        id: jstreeSelectedItemId,
        firstName: $('#m_FirstName').val(),
        lastName: $('#m_LastName').val(),
        middleName: $('#m_MiddleName').val(),
        group: $('#m_Group').val()
    };
    $.ajax({
        url: "Home/UpdateStudent",
        type: "POST",
        dataType: "json",
        success: function () {
            alert('ok');
        },
        statusCode: {
            500: function (content) {
                alert("Необработанная ошибка на сервере. Обратитесь к разрабочтику \n\nТекст ошибки: " + content.responseText);
            }
        },
        error: function (req, status, errorObj) {
            // handle status === "timeout"
            // handle other errors
        },
        data: student
    })
});

function onStudentLoadedFromJsTreeEditClicked(view) {
    if (view.student == null) {
        return;
    }

    $("#m_LastName").val(view.student.lastName);
    $("#m_FirstName").val(view.student.firstName);
    $("#m_MiddleName").val(view.student.middleName);
    $("#m_Group").val(view.student.group);

    $.getJSON("/Home/Teams", onTeamsLoadedFromJsTreeEditClicked);

}

function onTeamsLoadedFromJsTreeEditClicked(view) {
    $("#m_Team").empty();
    $.each(view, function (index, value) {
        $("#m_Team").append('<option>' + value.number + '</option>');
    });
}

function onStudentLoadedFromJsTreeChanged(view) {

    if (view.student == null) {
        return;
    }

    $("#SelectedStudent").text(view.student.fullName);

    $("#CurrentStudentLastName").text(view.student.lastName);
    $("#CurrentStudentFirstName").text(view.student.firstName);
    $("#CurrentStudentMiddleName").text(view.student.middleName);
    $("#CurrentStudentGroup").text(view.student.group);
    $("#CurrentStudentTeam").text(view.student.team.number);
    $("#CurrentStudentAverageValue").text(view.student.averageValue);

    $('#CurrentStudentHistory').empty();
    $.each(view.history,
        function (index, value) {
            $("#CurrentStudentHistory")
                .append('<tr>' +
                    '<td>' + value.date +
                    '</td>' +
                    '<td>' + value.value +
                    '</td>' +
                    '<td>' + value.algorithmName +
                    '</td>' +
                    '</tr>');
        });

    var studentContentControl = document.getElementById("StudentContent");
    studentContentControl.style.visibility = "visible";
}
