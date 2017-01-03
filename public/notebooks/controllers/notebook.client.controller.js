angular.module('userApp').controller('NotebookController', ['$scope', '$http', '$state', '$stateParams', 'NotebookAPI',
  function($scope, $http, $state, $stateParams, NotebookAPI) {
    $scope.getNotebookList = function() {
      NotebookAPI.getNotebookList().then(
        function(notebooks) {
          $scope.notebooks = notebooks;
        },
        function(errors) {
          console.log(errors)
        }
      )}

    $scope.showNotebook = function(editable) {
      var notebookId = $stateParams.notebookId;
      NotebookAPI.showNotebook(notebookId).then(
        function(notebook) {
          $scope.notebookData.title = notebook.title;
          var lines = notebook.lines;
          var textEditor = $scope.textEditor;
          textEditor.persistDataN($scope.max_lines, lines);
          if(!(editable)) { 
            textEditor.displayMode();
          }

        },
        function(data, status, headers, config) {
          console.log(data);
        });
    }

    $scope.makeEditable = function() {
      $scope.showNotebook(true);
    }

    $scope.editNotebook = function() {
      var lines = { }
      var textEditor = $scope.textEditor;
      textEditor.storableDataN($scope.max_lines, lines);
      $scope.notebookData.lines = lines;

      var notebookId = $stateParams.notebookId;
      NotebookAPI.editNotebook(notebookId, $scope.notebookData).then(
        function(data) {
          $state.go('notebooks.list');
        },
        function(errors) {
          console.log(errors);
        });
    }

    $scope.submitNotebook = function() {
      var lines = { }
      var textEditor = $scope.textEditor;
      textEditor.storableDataN($scope.max_lines, lines);

      $scope.notebookData.lines = lines,
        NotebookAPI.submitNotebook($scope.notebookData).then(
          function(data, status, headers, config) {
            $state.go('notebooks.list');
          },
          function(data, status, headers, config) {
            console.log(data);
          });
    }

    $scope.createTextEditors = function() {
      $scope.notebookData = { }
      $scope.textEditorName = 'text-editor-input';

      var textEditor = new TextEditor('.' + $scope.textEditorName);
      $scope.textEditor = textEditor;
      $scope.max_lines = 10;

      textEditor.generateN($scope.max_lines,['bold', 'forecolor','insertOrderedList','insertUnorderedList', 'insertimage', 'createlink', 'unlink', 'code']);
      textEditor.singleToolbar();
    }

    $scope.deleteNotebook = function(id) {
      NotebookAPI.deleteNotebook(id).then(
        function(data, status, headers, config) {
          current_notebooks = $scope.notebooks;
          for(var notebook of current_notebooks){
            if(notebook._id == data.data.notebook._id) {
              notebook.display = false;
              $scope.notebooks = current_notebooks;
              return
            }
          }
        },
        function(data, status, headers, config) {
          $scope.errors = data;
        }
      )
    }
  }]
);

function addParametersToNotebooks(notebook_list){
  var styles = ["success", "info", "warning", "danger"];
  for(var notebook of notebook_list) {
    style_number = Math.floor(Math.random()*(4));
    notebook.style = styles[style_number];
    notebook.display = true;
  }
  return notebook_list
}

angular.module('userApp').directive('notebookBlock', function() {
  return {
    templateUrl: 'notebooks/views/notebook-block.html',
    replace: true,
    scope: {
      style: '@',
      title: '@',
      displayLine: '@',
      id: '@',
      deleteNotebook: '&',
      renderEdit: '&'
    }
  }
});
