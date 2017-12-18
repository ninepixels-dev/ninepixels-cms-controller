/* global MediumEditor */

'use strict';

htmlEditor.$inject = ['config'];
function htmlEditor(config) {
    return {
        require: 'ngModel',
        controller: 'npImagePickerCtrl',
        controllerAs: 'picker',
        link: function (scope, element, attr, ngModel) {
            if (!ngModel)
                return;

            var galleryButton = MediumEditor.Extension.extend({
                name: 'gallery',

                init: function () {
                    this.button = this.document.createElement('button');
                    this.button.classList.add('medium-editor-action');
                    this.button.innerHTML = '<i class="glyphicon glyphicon-picture"></i>';
                    this.button.title = 'Add picture';

                    this.on(this.button, 'click', this.handleClick.bind(this));
                },

                getButton: function () {
                    return this.button;
                },

                handleClick: function (event) {
                    var self = this, path = config.server_url + config.images.gallery;

                    scope.picker.trigger().then(function (image) {
                        return self.addContent('<img src="' + path + image.url + '" alt="' + image.alt + '" title="' + image.title + '" />');
                    });

                    this.base.checkContentChanged();
                },

                addContent: function (html) {
                    var sel, range;
                    if (window.getSelection) {
                        // IE9 and non-IE
                        sel = window.getSelection();

                        if (sel.getRangeAt && sel.rangeCount) {
                            range = sel.getRangeAt(0);
                            range.deleteContents();

                            var el = document.createElement("div");
                            el.innerHTML = html;
                            var frag = document.createDocumentFragment(), node, lastNode;
                            while ((node = el.firstChild)) {
                                lastNode = frag.appendChild(node);
                            }
                            var firstNode = frag.firstChild;
                            range.insertNode(frag);

                            // Preserve the selection
                            if (lastNode) {
                                range = range.cloneRange();
                                range.setStartAfter(lastNode);
                                range.collapse(true);
                                sel.removeAllRanges();
                                sel.addRange(range);
                            }
                        }
                    } else if ((sel = document.selection) && sel.type != "Control") {
                        // IE < 9
                        var originalRange = sel.createRange();
                        originalRange.collapse(true);
                        sel.createRange().pasteHTML(html);
                    }
                }
            });

            var editor = new MediumEditor(element, {
                autoLink: true,
                targetBlank: true,
                placeholder: false,
                toolbar: {
                    relativeContainer: element.parent()[0],
                    buttons: ['h1', 'h2', 'h3', 'h4', 'quote', 'unorderedlist', 'table', 'bold', 'italic', 'underline', 'anchor', 'removeFormat', 'gallery'],
                    static: true,
                    updateOnEmptySelection: true
                },
                extensions: {
                    table: new MediumEditorTable(),
                    gallery: new galleryButton()
                },
                anchor: {
                    placeholderText: 'Type a link',
                    linkValidation: true,
                    customClassOption: 'btn',
                    customClassOptionText: 'Create Button',
                    targetCheckbox: true,
                    targetCheckboxText: 'Open in new window'
                },
                paste: {
                    cleanPastedHTML: true
                }
            });

            ngModel.$render = function () {
                editor.setContent(ngModel.$viewValue || "");
            };

            editor.subscribe('editableInput', function (e, elem) {
                ngModel.$setViewValue(elem.innerHTML.trim());
            });

            scope.$on('$destroy', function () {
                editor.destroy();
            });
        }
    };
}

angular.module('ninepixels.ui', [])
        .directive('npHtmlEditor', htmlEditor);