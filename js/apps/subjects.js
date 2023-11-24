

class Contacts {
    get options() {
        return {
            emptyThumb: Helpers.UrlFix('/img/profile/profile-11.webp'),
        };
    }

    constructor(options = {}) {
        this.settings = Object.assign(this.options, options);

        this.contactModal = new bootstrap.Modal(document.getElementById('contactModal'));
        this.deleteConfirmModal = new bootstrap.Modal(document.getElementById('deleteConfirmModal'));

        Helpers.FetchJSON(Helpers.UrlFix('/api/v1/admin/subjects'), (data) => {
            this.contacts = data.data.map((d) => {
                return {
                    ...d,
                    // thumb: Helpers.UrlFix(d.thumb),
                };
            });
            this._init();
        });
    }

    _init() {
        this.contactContainer = document.querySelector('#contacts .list');
        this.currentItem = null;
        this.listjs = null;
        this.deletingMultiple = false;
        this._addListeners();
        this._initListjs();
        this._initProfileUpload();
        this._initGroupSelect();
        this._initCheckAll();
    }

    _addListeners() {
        this.contactContainer.addEventListener('click', this._onContainerClick.bind(this));
        document.getElementById('newContactButton') && document.getElementById('newContactButton').addEventListener('click', this._showAddModal.bind(this));
        document.getElementById('deleteContact') && document.getElementById('deleteContact').addEventListener('click', this._deleteContact.bind(this));
        document.getElementById('addContact') && document.getElementById('addContact').addEventListener('click', this._addContact.bind(this));
        document.getElementById('saveContact') && document.getElementById('saveContact').addEventListener('click', this._saveContact.bind(this));
        document.getElementById('deleteConfirmButton') &&
        document.getElementById('deleteConfirmButton').addEventListener('click', this._deleteContactConfirm.bind(this));
        document.getElementById('deleteChecked') && document.getElementById('deleteChecked').addEventListener('click', this._deleteChecked.bind(this));
    }

    // Select2 plugin initialization in the add/edit modal
    _initGroupSelect() {
        if (jQuery().select2) {
            jQuery('#contactGroupModal').select2({minimumResultsForSearch: Infinity});
        }
    }

    // Check all button initialization
    _initCheckAll() {
        new Checkall(document.querySelector('.check-all-container-checkbox-click .btn-custom-control'), {clickSelector: '.form-check'});
    }

    // Initializing list.js with the values
    _initListjs() {
        this.listjs = new List(
            document.querySelector('#contacts'),
            {
                valueNames: ['id', 'subject_name', 'added_by', 'created_at', 'status'],
                item: 'contactItemTemplate',
                page: 8,
                pagination: [
                    {
                        includeDirectionLinks: true,
                        leftDirectionText: '<i class="cs-chevron-left"></i>',
                        rightDirectionText: '<i class="cs-chevron-right"></i>',
                        liClass: 'page-item',
                        aClass: 'page-link shadow',
                        innerWindow: 1000, // Hiding ellipsis
                    },
                ],
            },
            this.contacts,
        );
        this.listjs.sort('id', {order: 'desc'});
        this.listjs.on('updated', function (obj) {});
    }

    // List item click event
    _onContainerClick(event) {

        if (!event.target.closest('.view-click')) {
            return;
        }
        event.preventDefault();
        const parent = event.target.closest('.card');
        const id = parent.querySelector('.id').innerHTML;
        // console.log(this.listjs.get('id', id)[0]);
        this.currentItem = this.listjs.get('id', id)[0];
        this._showDetailModal();
    }

    // Empty modal to add new
    _showAddModal(event) {
        this._clearAddEditModal();
        this._enableAdd();
        this.contactModal.show();
    }

    // Shows item on the modal after click
    _showDetailModal() {
        document.getElementById('subjectNameModal').value = this.currentItem.values().subject_name;
        document.getElementById('contactGroupModal').value = this.currentItem.values().status;


        jQuery('#contactGroupModal').trigger('change');
        this.contactModal.show();
        this._enableEdit();
    }

    // Updating an item
    _saveContact() {
        const id = this.currentItem.values().id;
        const valuesFromModal = this._getCurrentDataFromModal(id);
        this.currentItem.values(valuesFromModal);
        this.contactModal.hide();
        // Data can be synced here with the backend

        // ajax to
        $.ajax({
            method:"PUT",
            url: "/api/v1/admin/subjects/" + id,
            data: {
                subject_name: valuesFromModal['subject_name'],
                status: valuesFromModal['status']
            },
            dataType:"JSON",
            success: function(result){

            },
            error: function(results){

            }
        });

    }

    // Adding a new item
    _addContact() {
        const items = this.listjs.items.map((item) => item.values());
        const nextId = Helpers.NextId(items, 'id');
        const newContact = this._getCurrentDataFromModal(nextId);
        this.listjs.add(newContact);
        this.contactModal.hide();
        const adminId = document.getElementById('adminId').value;
        // this.listjs.update();
        this.listjs.sort('id', {order: 'desc'});

            // ajax to
                $.ajax({
                                method:"POST",
                                url: "/api/v1/admin/subjects",
                                data: {
                                    subject_name: newContact['subject_name'],
                                    status: newContact['status'],
                                    added_user_id : adminId,
                                },
                                dataType:"JSON",
                                success: function(result){

                                    },
                                error: function(results){

                                }
                    });



        // Data can be synced here with the backend
    }

    // Showing confirmation for deleting an item
    _deleteContact(event) {
        this.deletingMultiple = false;
        document.getElementById('deleteConfirmDetail').innerHTML = this.currentItem.values().subject_name;
        this.deleteConfirmModal.show();
    }

    // Showing confirmation for deleting multiple items
    _deleteChecked(event) {
        this.deletingMultiple = true;
        const selectedItems = document.querySelectorAll('.list .card.selected');
        if (selectedItems.length > 0) {
            document.getElementById('deleteConfirmDetail').innerHTML = selectedItems.length + ' item' + (selectedItems.length > 1 ? 's' : '');
            this.deleteConfirmModal.show();
        }
    }

    // Deleting an item or multiple based on the deletingMultiple variable
    _deleteContactConfirm(event) {
        if (this.deletingMultiple) {
            // Deleting multiple items
            const selectedItems = document.querySelectorAll('.list .card.selected');
            selectedItems.forEach((item) => {
                this.listjs.remove('id', item.querySelector('.id').innerHTML);
            });
        } else {
            // Deleting single item
            const id = this.currentItem.values().id;
            this.listjs.remove('id', id);

            // ajax to
            $.ajax({
                method:"DELETE",
                url: "/api/v1/admin/subjects/"+id,
                dataType:"JSON",
                success: function(result){
                },
                error: function(results){

                }
            });



        }
        this.contactModal.hide();
        this.deleteConfirmModal.hide();
        const checkAllInput = document.querySelector('.check-all-container-checkbox-click .btn-custom-control input');
        checkAllInput.indeterminate = false;
        checkAllInput.checked = false;
        // Data can be synced here with the backend
    }

    // Getting values from the inputs
    _getCurrentDataFromModal(id) {
        return {
            subject_name: document.getElementById('subjectNameModal').value,
            status: document.getElementById('contactGroupModal').value,
            // email: document.getElementById('contactEmailModal').value,
            // phone: document.getElementById('contactPhoneModal').value,
            // group: document.getElementById('contactGroupModal').value,
            // thumb: document.getElementById('contactThumbModal').getAttribute('src'),
            id: id,
        };
    }

    // Simple image uplader
    _initProfileUpload() {
        if (typeof SingleImageUpload !== 'undefined') {
            const singleImageUpload = new SingleImageUpload(document.getElementById('imageUpload'), {
                fileSelectCallback: (file) => {
                    console.log(file);
                    // Upload the file with fetch method
                    // let formData = new FormData();
                    // formData.append("file", file);
                    // formData.append("id", this.currentItemData.id);
                    // fetch('/upload/image', { method: "POST", body: formData });
                },
            });
        }
    }

    // Clearing values of the modal
    _clearAddEditModal() {
        document.getElementById('subjectNameModal').value = '';
        document.getElementById('contactGroupModal').value = '';

        jQuery('#contactGroupModal').trigger('change');
    }

    _enableEdit() {
        this._showElement('saveContact');
        this._showElement('deleteContact');
        this._hideElement('addContact');
    }

    _enableAdd() {
        this._hideElement('saveContact');
        this._hideElement('deleteContact');
        this._showElement('addContact');
    }

    _showElement(selector) {
        document.getElementById(selector) && document.getElementById(selector).classList.add('d-inline-block');
        document.getElementById(selector) && document.getElementById(selector).classList.remove('d-none');
    }

    _hideElement(selector) {
        document.getElementById(selector) && document.getElementById(selector).classList.remove('d-inline-block');
        document.getElementById(selector) && document.getElementById(selector).classList.add('d-none');
    }
}
