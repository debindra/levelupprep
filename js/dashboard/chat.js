class Chat{
    constructor() {
        this.websocketConnected = true;
        this._connectWebsockets();
        window.messageReceivedCallback = (message) => this.__onMessageReceived(message);
        this.contactsListContainer = document.getElementById('contactsListContainer');
        this.chatContentContainer = document.getElementById('chatContentContainer');
        this.listItemTemplate = document.getElementById('listItemTemplate');
        this.chatContentScroll = null;
        this.mobileBreakpoint = Globals.md.replace('px', '');
        this.respondContainerTemplate = document.getElementById('respondContainerTemplate');
        this.respondAttachmentContentTemplate = document.getElementById('respondAttachmentContentTemplate');
        this.respondTextContentTemplate = document.getElementById('respondTextContentTemplate');
        this.messageContainerTemplate = document.getElementById('messageContainerTemplate');
        this.messageAttachmentContentTemplate = document.getElementById('messageAttachmentContentTemplate');
        this.messageTextContentTemplate = document.getElementById('messageTextContentTemplate');
        this.listView = document.getElementById('listView');
        this.chatInput = document.querySelector('#chatInput');
        this.currentChatData = null;
        this.alreadyFetchMessages = [];

        this._fetchContacts()
    }

    _fetchContacts() {
        this._getContacts((contacts) => {
            contacts = contacts.map(c => {
                var lastOnline = c.last_online ? `Last online ${c.last_online}` : '';

                c.id = c.contactId.toString();
                c.status = c.status || 'offline';
                c.last_online = c.status === 'online' ? 'online' : lastOnline

                return c
            })

            this.chatData = contacts

            this._init(true);
        })
    }

    _connectWebsockets(){
        window.Echo.connector.pusher.connection.bind('connected', () => {
            this.websocketConnected = true;
            console.log('Websocket connected. No polling...')
        });

        window.Echo.connector.pusher.connection.bind('unavailable', () => {
            this.websocketConnected = false;
            console.log('Websocket disconnected. Polling...')
            this._getNewMessagesForUser(Laravel.userId)
        });

        window.Echo.connector.pusher.connection.bind('error', () => {
            this.websocketConnected = false;
            console.log('Websocket disconnected. Polling...')
            this._getNewMessagesForUser(Laravel.userId)
        });

    }

    _init(websocketPolling){
        this._initView();
        //this._initMode();
        this._initScrollbars();
        this._renderContacts();
        this._initTextArea();
        this._addListeners();
        //if (this.currentView === 'desktop') {
        const urlParams = new URLSearchParams(location.search);

        // const id =  urlParams.has('userId')? urlParams.get('userId'):  this.chatData[0].id;
        // this._renderChatMessagesById(id);
        this._renderChatMessagesById(this.chatData[0].id);
        //}
        this._updateChatScrollDelayed();
        if (websocketPolling) {
            this._getNewMessagesForUser(Laravel.userId)
        }
    }

    _getContacts(callback){
        $.ajax({
            type: 'GET',
            url:  `/api/v1/contacts/${Laravel.userId}`,
            processData: false,
            contentType: false,
            success: function (response) {
                if(callback){
                    callback(response)
                }
            },
            failure: function (response) { console.log('error',response) },
        })
    }

    _submitMessage(message) {
        const vm = this;
        const data = new FormData()
        for (const key in message) {
            data.append(key, message[key])
        }
        data.append('sender_id', Laravel.userId )
        $.ajax({
            type: 'POST',
            url:  "/api/v1/chat",
            data: data,
            processData: false,
            contentType: false,
            success: function (response) {
                vm._renderChatMessage(response, vm.chatContentContainer.querySelector('.os-content'));
                vm._updateChatScroll();
                vm._updateChatData(response);
            },
            failure: function (response) { console.log('error',response) },
        })
    }

    _submitAttachment(message, callback){
        const data = new FormData()
        for (const key in message) {
            data.append(key, message[key])
        }
        data.append('sender_id', Laravel.userId )
        $.ajax({
            type: 'POST',
            url:  "/api/v1/chat",
            data: data,
            processData: false,
            contentType: false,
            success: function (response) {
                if (callback) {
                    callback(response)
                }
            },
            failure: function (response) { console.log('error',response) },
        })
    }

    _readMessage(message) {
        $.ajax({
            type: 'PUT',
            url:  `/api/v1/chat/read/${message.id}`,
            data: new FormData(),
            processData: false,
            contentType: false,
            failure: function (response) { console.log('error',response) },
        })
    }

    _readMessageByReceiver(userId, senderId) {
        const data = new FormData()
        data.append('sender_id', senderId);
        $.ajax({
            type: 'POST',
            url:  `/api/v1/chat/read-receiver/${userId}`,
            headers: {
                'X-HTTP-Method-Override': 'PUT'
            },
            data: data,
            processData: false,
            contentType: false,
            failure: function (response) { console.log('error',response) },
        });
    }

    _getNewMessagesForUser(id){
        const vm = this;
        if (this.websocketConnected) {
            /*setTimeout(()=> {
                this._getNewMessagesForUser(id)
            }, 10000)*/
            return
        }
        setTimeout(() => {
            $.ajax({
                type: 'GET',
                url:  `/api/v1/chat/${id}`,
                processData: false,
                contentType: false,
                success: function (response) {
                    for (const message of response) {
                        message.attachments = []
                        //vm._updateChatData(message)
                        const partners = [message.sender_id, message.receiver_id]
                        if (partners.includes(id) && partners.includes(vm.currentChatData.id)){
                            if (vm.currentChatData.messages.find(m => m.id === message.id)){
                                continue;
                            }
                            vm._updateChatData(message)
                            vm._renderChatMessage(message, vm.chatContentContainer.querySelector('.os-content'))
                            vm._readMessage(message)
                        } else if (message.receiver_id === Laravel.userId){
                            const contact = vm.chatData.find(c => c.id === message.sender_id)
                            if (contact) {
                                if (contact.messages.find(m => m.id === message.id)){
                                    continue;
                                }
                                contact.messages.push(message)
                                vm._renderContacts(vm.currentChatData.id)
                            }
                        }
                    }
                    vm._getNewMessagesForUser(id)
                },
                failure: function (response) {
                    console.log('error',response)
                    vm._getNewMessagesForUser(id)
                },
            })
        }, 5000)
    }

    __onMessageReceived(message){
        this._addNewMessageToChatData(message);
        if (message.sender_id == this.currentChatData.contactId) {
            this._renderChatMessagesById(this.currentChatData.contactId);
            this._scrollWindowForChat();
        } else {
            this._renderContacts();
        }
    }

    _addNewMessageToChatData(message) {
        var contactIndex = this.chatData.map(function(o) { return o.contactId; }).indexOf(message.sender_id);

        this.chatData[contactIndex].messages.push(message);
        this.chatData[contactIndex].unread++;
    }

    // Initializing view and updating view variable
    _initView() {
        const windowWidth = window.innerWidth;
        let newView = null;
        /*if (this.mobileBreakpoint > windowWidth) {
            newView = 'mobile';
        } else {
            newView = 'desktop';
        }*/
        newView = 'desktop'
        if (newView !== this.currentView) {
            if (this.currentView === 'mobile' && this.currentChatData === null) {
                this._renderChatMessagesById(this.chatData[0].id);
            }
            this.currentView = newView;
            this._updateView();
        }
    }

    // Switching between views for mobile and desktop. Showing only chat or only user list at a time for mobile and showing both for desktop
    _updateView() {
        if (this.currentView === 'mobile') {
            // Init mobile view
            // Show list view
            this._showListView();
            this._disableBackButton();
            this._showChatBackButton();
        } else {
            // Init desktop view
            this._showBothViews();
            //this._hideChatBackButton();
        }
    }

    // Showing chat view
    _showChatView() {

        this.listView.classList.remove('d-flex');
        this.listView.classList.add('d-none');
    }

    // Showing contact list view
    _showListView() {
        this.listView.classList.add('d-flex');
        this.listView.classList.remove('d-none');
    }

    // Showing both list view and chat view
    _showBothViews() {
        this.listView.classList.add('d-flex');
        this.listView.classList.remove('d-none');
    }

    _enableBackButton() {
        document.getElementById('backButton').classList.remove('disabled');
    }

    _disableBackButton() {
        document.getElementById('backButton').classList.add('disabled');
    }

    // Switching 'mode' between chat and call
    _initMode() {
        //document.getElementById('chatMode').classList.remove('d-none');
        //document.getElementById('chatMode').classList.add('d-flex');
    }

    // Adding listeners for buttons, resize and keyboard
    _addListeners() {
        this.chatInput.addEventListener('keydown', this._onChatInputKeyDown.bind(this));
        document.getElementById('chatSendButton') && document.getElementById('chatSendButton').addEventListener('click', this._inputSend.bind(this));
        document.getElementById('chatAttachButton') && document.getElementById('chatAttachButton').addEventListener('click', this._attachmentSend.bind(this));
        document.getElementById('chatFileButton') && document.getElementById('chatFileButton').addEventListener('click', this._fileSend.bind(this));
        document.getElementById('chatAttachmentInput') &&
        document.getElementById('chatAttachmentInput').addEventListener('change', this._onAttachmentChange.bind(this));
        document.getElementById('chatFileInput') &&
        document.getElementById('chatFileInput').addEventListener('change', this._onFileChange.bind(this));
        document.getElementById('backButton') && document.getElementById('backButton').addEventListener('click', this._onBackClick.bind(this));
        document.getElementById('endCallButton') && document.getElementById('endCallButton').addEventListener('click', this._onEndCallClick.bind(this));
        document.getElementById('callButton') && document.getElementById('callButton').addEventListener('click', this._onCallClick.bind(this));
        document.getElementById('videoCallButton') && document.getElementById('videoCallButton').addEventListener('click', this._onCallClick.bind(this));

        this.contactsListContainer && this.contactsListContainer.addEventListener('click', this._onContactListClick.bind(this));
        window.addEventListener('resize', Helpers.Debounce(this._onResizeDebounced.bind(this), 200).bind(this));
        window.addEventListener('resize', this._onResize.bind(this));
    }

    // Showing back button for chat screens
    _showChatBackButton() {
        document.getElementById('backButton').classList.remove('d-none');
    }

    // Hiding back button for call screens
    _hideChatBackButton() {
        document.getElementById('backButton').classList.add('d-none');
    }

    // Resize with a debounce
    _onResizeDebounced(event) {
        this._updateChatScroll();
    }

    // Resize handler
    _onResize(event) {
        this._initView();
    }

    // End click listener
    _onEndCallClick(event) {
        this.currentMode = 'chat';
        //this._initMode();
    }

    // Call click listener
    _onCallClick(event) {
        this.currentMode = 'call';
        //this._initMode();
    }

    // Call screen
    _renderCall() {
        const callMode = document.getElementById('callMode');
        callMode.querySelector('.name').innerHTML = this.currentChatData.name;
        callMode.querySelector('.profile').setAttribute('src', this.currentChatData.thumb);
        this._startTimer(callMode.querySelector('.time'));
    }

    // Call screen timer starter
    _startTimer(timer) {
        timer.innerHTML = '00:00:00';
        var startTimestamp = moment().startOf('day');
        this.timerInterval = setInterval(function () {
            startTimestamp.add(1, 'second');
            timer.innerHTML = startTimestamp.format('HH:mm:ss');
        }, 1000);
    }
    // Call screen timer clear
    _endTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
    }

    // Back button listener for mobile
    _onBackClick(event) {
        this.currentChatData = null;
        this._renderContacts();
        this._showListView();
        this._disableBackButton();
        if (this.currentMode !== 'chat') {
            this.currentMode = 'chat';
            //this._initMode();
        }
    }

    // Renders all the users both from messages and contacts
    _renderContacts(currentContact) {
        //this.messagesListContainer.querySelector('.os-content').innerHTML = '';
        this.contactsListContainer.querySelector('.os-content').innerHTML = '';
        this.chatData.map((contact) => {
            //contact.messages.length > 0 && this._renderContact(contact, this.messagesListContainer.querySelector('.os-content'));
            this._renderContact(contact, this.contactsListContainer.querySelector('.os-content'));
        });
        if (currentContact){
            this._renderChatMessagesById(currentContact)
        }

        var contactSeparatorLn = document.getElementsByClassName('contact-separator').length
        if (contactSeparatorLn > 1) {
            document.getElementsByClassName('contact-separator')[contactSeparatorLn - 2].classList.add('border-bottom-0')
        }
    }

    // Renders a single user
    _renderContact(contact, container) {
        var itemClone = this.listItemTemplate.cloneNode(true).querySelector('.contact-list-item');
        itemClone.setAttribute('data-id', contact.id);
        // itemClone.setAttribute('href',tutorProfilePageUrl);
        itemClone.querySelector('.role-badge').innerHTML = contact.role.charAt(0).toUpperCase() + contact.role.slice(1).toLowerCase()
        if(contact.role === 'STUDENT'){
            itemClone.querySelector('.role-badge').classList.add("student");
        } else if(contact.role === 'ADMIN') {
            itemClone.querySelector('.role-badge').classList.add("admin");
        } else if(contact.role === 'TUTOR') {
            itemClone.querySelector('.role-badge').classList.add("tutor");
            itemClone.querySelector('.contact-menu').classList.remove('d-none');
            itemClone.querySelector('.contact-menu').addEventListener("click", (e) => {
                e.stopPropagation();
            });
            itemClone.querySelector('.remove-tutor').addEventListener('click', (e) => {
                e.stopPropagation();
                this._removeFromContact(contact.id);
            });
        }

        itemClone.querySelector('#contactName').innerHTML = contact.name;
        itemClone.querySelector('#contactLastSeen').innerHTML = contact.last_online;
        itemClone.querySelector('#contactImage').setAttribute('src', `/storage/${contact.profile_image}`);

        if (Laravel.role === 'STUDENT') {
            if (contact.role === 'TUTOR') {
                itemClone.querySelector('#bookButton').addEventListener("click", (e) => {
                    e.stopPropagation();

                    goToProfile(contact.id);
                });
                itemClone.querySelector('#contactImage').addEventListener("click", (e) => {
                    e.stopPropagation();

                    goToProfile(contact.id);
                });
            } else {
                itemClone.querySelector('#bookButton').classList.add('hide');
            }
        }

        if (contact.unread > 0) {
            itemClone.querySelector('.contact-unread').innerHTML = contact.unread;
            itemClone.querySelector('.contact-unread').classList.remove('d-none');
        }
        container.append(itemClone);
    }

    // Sets name and image of the title in the chat container
    _renderContactTitle() {
        const contactTitle = document.getElementById('chatTitle');
        contactTitle.querySelector('.name').innerHTML = this.currentChatData.name;
        contactTitle.querySelector('.last').innerHTML = this.currentChatData.last_online;
        document.getElementById('chatProfile').setAttribute('src', `/storage/${this.currentChatData.profile_image}`);
        document.getElementById('chatProfile').setAttribute('onerror', "this.onerror=null; this.src='/img/profile/profile-11.webp'");
        if (this.currentChatData.status !== 'online') {
            document.getElementById('onlineStatus').classList.add('bg-separator');
            document.getElementById('onlineStatus').classList.remove('bg-primary');
        }

        if (this.currentChatData.status !== 'offline') {
            document.getElementById('onlineStatus').classList.add('bg-primary');
            document.getElementById('onlineStatus').classList.remove('bg-separator');
        }
    }
    // Sets selected contact
    _setActiveContact() {
        this.userProfileTabs.querySelectorAll('.contact-list-item').forEach((element) => {
            element.classList.remove('active');
            if (parseInt(element.getAttribute('data-id')) === parseInt(this.currentChatData.id)) {
                element.classList.add('active');
            }
        });
    }

    // Makes unread message zero
    _setAsRead() {
        if (this.currentChatData.unread > 0) {
            this.currentChatData.unread = 0;
            this._renderContacts();
            this._readMessageByReceiver(Laravel.userId, this.currentChatData.contactId);
            //this._setActiveContact();
        }
    }

    // Renders all the messages and responses from a clicked person
    _renderChatMessagesById(id) {
        console.log('id', id);
        this._fetchAllMessage(id)
            .then((response) => {
                this._resetDataMessages(id, response)
            }).then(() => {
                this.currentChatData = this._getDataById(id);
                this.chatContentContainer.querySelector('.os-content').innerHTML = '';
                this.currentChatData.messages.map((chat) => {
                    this._renderChatMessage(chat, this.chatContentContainer.querySelector('.os-content'));
                });
                this._renderContactTitle();
                //baguetteBox.run('.lightbox');
                //this._setActiveContact();
                this._setAsRead();
                const chaInputElement = document.getElementById('chatInputCard')
                if (chaInputElement){
                    chaInputElement.classList.remove('d-none')
                }

                const chatCardElement = document.getElementById('chatCard')
                chatCardElement.querySelector('.profile').setAttribute('src', `/storage/${this.currentChatData.profile_image}`);

                if (chatCardElement){
                    chatCardElement.classList.remove('d-none')
                }
            }).then(() => {
                this._updateChatScroll();
            })
    }

    // Renders a single chat message or response
    _renderChatMessage(chat, container) {
        var itemClone = null;
        var containerClone = null;
        if (chat.receiver_id == Laravel.userId) {
            // Adding content from the contact
            containerClone = this.respondContainerTemplate.cloneNode(true).querySelector('div');
            containerClone.querySelector('.chat-profile').setAttribute('src', `/storage/${this.currentChatData.profile_image}`);
            containerClone.querySelector('.chat-profile').setAttribute('onerror', "this.onerror=null; this.src='/img/profile/profile-11.webp'");

            if (chat.type === 'text') {
                itemClone = this.respondTextContentTemplate.cloneNode(true).querySelector('div');
                itemClone.querySelector('.text').innerHTML = chat.message;
                itemClone.querySelector('.time').innerHTML = new moment(chat.created_at).format('h:mm A');
                containerClone.querySelector('.content-container').append(itemClone);
                container.append(containerClone);
            } else {
                const attachment = chat.message
                itemClone = this.respondAttachmentContentTemplate.cloneNode(true).querySelector('div');
                itemClone.querySelector('.time').innerHTML = new moment(chat.created_at).format('h:mm A');
                if (chat.type === 'image') {
                    itemClone.querySelector('.attachment img').setAttribute('src', `/storage/${attachment}`);
                    itemClone.querySelector('.attachment img').classList.remove('d-none')
                    itemClone.querySelector('.attachment span').classList.add('d-none')
                } else{
                    itemClone.querySelector('.attachment img').classList.add('d-none')
                    itemClone.querySelector('.attachment span').classList.remove('d-none')
                }
                itemClone.querySelector('.attachment').setAttribute('href', `/storage/${attachment}`);
                containerClone.querySelector('.content-container').append(itemClone);
                container.append(containerClone);
            }
        } else {
            // Adding content from the user
            containerClone = this.messageContainerTemplate.cloneNode(true).querySelector('div');
            containerClone.querySelector('.chat-profile').setAttribute('src', `/storage/${Laravel.profileImage}`);
            containerClone.querySelector('.chat-profile').setAttribute('onerror', "this.onerror=null; this.src='/img/profile/profile-11.webp'");

            if (chat.type === 'text') {
                itemClone = this.messageTextContentTemplate.cloneNode(true).querySelector('div');
                itemClone.querySelector('.text').innerHTML = chat.message;
                itemClone.querySelector('.time').innerHTML = new moment(chat.created_at).format('h:mm A');
                containerClone.querySelector('.content-container').append(itemClone);
                container.append(containerClone);
            } else {
                const attachment = chat.message
                itemClone = this.messageAttachmentContentTemplate.cloneNode(true).querySelector('div');
                itemClone.querySelector('.time').innerHTML = new moment(chat.created_at).format('h:mm A');
                if (chat.type === 'image') {
                    itemClone.querySelector('.attachment img').setAttribute('src', `/storage/${attachment}`);
                    itemClone.querySelector('.attachment img').classList.remove('d-none')
                    itemClone.querySelector('.attachment span').classList.add('d-none')
                } else{
                    itemClone.querySelector('.attachment img').classList.add('d-none')
                    itemClone.querySelector('.attachment span').classList.remove('d-none')
                }
                itemClone.querySelector('.attachment').setAttribute('href', `/storage/${attachment}`);
                containerClone.querySelector('.content-container').append(itemClone);
                container.append(containerClone);
            }
        }
    }

    // Returns chat data from the array by id
    _getDataById(id) {
        return this.chatData.find((data) => {
            if (data.id == id) {
                return data;
            }
        });
    }

    // Implementing the autosize plugin to make text area expand
    _initTextArea() {
        autosize(this.chatInput);
        this.chatInput.addEventListener('autosize:resized', this._chatInputResize.bind(this));
    }

    _chatInputResize() {
        this._updateChatScroll();
    }

    // Click listener for input send button, also called via enter key press. Adds the new message to the chat container and to the data array.
    _inputSend(event) {
        const message = {
            type: 'text',
            message: this.chatInput.value,
            receiver_id: this.currentChatData.id,
            created_at: new Date(),
            attachments: [],
        };
        this._submitMessage(message)
        this.chatInput.value = '';
        this.chatInput.focus();
    }

    // Updates and changes message from tha data.
    _updateChatData(message) {
        const messageCount = this.currentChatData.messages.length;
        if (this.currentChatData.messages.find(m => m.id === message.id)){
            return;
        }
        this.currentChatData.messages.push(message);
        if (messageCount === 0) {
            this._renderContacts();
            //this._setActiveContact();
        }

        var elem = document.getElementById('chatContentContainer');
        elem.scrollTop = elem.scrollHeight;
    }

    // Attach button click listener, triggers a click on the hidden file input.
    _attachmentSend(event) {
        document.getElementById('chatAttachmentInput').dispatchEvent(new MouseEvent('click'));
    }

    _fileSend(event) {
        document.getElementById('chatFileInput').dispatchEvent(new MouseEvent('click'));
    }

    _onFileChange(event) {
        this._onAttachmentChange(event, 'file')
    }

    // Attachment input change listener
    _onAttachmentChange(event, type='image') {
        const input = document.getElementById(type === 'image' ? 'chatAttachmentInput' : 'chatFileInput');
        if (input.files && input.files[0]) {
            const attachment = {
                type: type,
                message: '',
                attachment: input.files[0],
                created_at: new moment().format('h:mm A'),
                receiver_id: this.currentChatData.id, // Adding .webp to make it work with lightbox plugin baguettebox
            };
            this._submitAttachment(attachment, (message) => {
                this._renderChatMessage(message, this.chatContentContainer.querySelector('.os-content'));
                this._updateChatScroll();
                this._updateChatData(message);
            })
            // var reader = new FileReader();
            /*reader.onload = (onLoadEvent) => {
              this._renderChatMessage(attachment, this.chatContentContainer.querySelector('.os-content'));
              baguetteBox.destroy();
              baguetteBox.run('.lightbox');
              this._updateChatScroll();
              this._updateChatData(attachment);
            };
            reader.readAsDataURL(input.files[0]);*/
        }
    }

    // Keydown listener for the main chat input to determine enter vs shift+enter.
    _onChatInputKeyDown(event) {
        if (event.keyCode == 13) {
            event.preventDefault();
            if (event.shiftKey) {
                var currentValue = this.chatInput.value;
                currentValue += '\n';
                this.chatInput.value = currentValue;
                autosize.update(this.chatInput);
                this._updateChatScroll();
            } else {
                this._inputSend();
            }
        }
    }

    // Click listener for contact list items.
    _onContactListClick(event) {
        const contactElement = event.target.closest('.contact-list-item');
        //const dataElement = contactElement.selector('a');
        if (contactElement) {
            const contactId = contactElement.getAttribute('data-id');
            this._updateView();
            this._renderChatMessagesById(contactId);

            this._scrollWindowForChat();
        }
    }

    // Initializing contact list and chat scrollbars and keeping a reference for chat scroll.
    _initScrollbars() {
        if (typeof OverlayScrollbars !== 'undefined') {
            //OverlayScrollbars(this.messagesListContainer, {scrollbars: {autoHide: 'leave', autoHideDelay: 600}, overflowBehavior: {x: 'hidden', y: 'scroll'}});
            OverlayScrollbars(
                this.contactsListContainer,
                {
                    scrollbars: {
                        autoHide: 'leave',
                        autoHideDelay: 600
                    },
                    overflowBehavior: {
                        x: 'hidden',
                        y: 'scroll'
                    }
                }
            );
            this.chatContentScroll = OverlayScrollbars(this.chatContentContainer, {
                scrollbars: {
                    autoHide: 'leave',
                    autoHideDelay: 600
                },
                overflowBehavior: {
                    x: 'hidden',
                    y: 'scroll'
                }
            });
        }
    }

    // Updating the chat scrollbar to make it scroll to the bottom.
    _updateChatScroll() {
        this.chatContentScroll.scroll({el: this.chatContentContainer.querySelector('.card-content:last-of-type'), scroll: {x: 'never'}, block: 'end'}, 0);
    }

    // A delayed version of chat scroll update since it does not work when used without delay on the initial call.
    _updateChatScrollDelayed() {
        setTimeout(() => {
            this._updateChatScroll();
            this.chatContentContainer.classList.remove('opacity-0');
        }, 100);
    }

    _setToOnline(userId) {
        if (userId !== Laravel.userId) {
            setTimeout(() => {
                var contactIndex = this.chatData.map(function(o) { return o.contactId; }).indexOf(userId);

                this.chatData[contactIndex]['status'] = 'online';
                this.chatData[contactIndex]['last_online'] = 'online';

                this._renderContacts()
                this._renderContactTitle()
            }, 1500);
        }
    }

    _setToOfline(userId, lastOnline) {
        var contactIndex = this.chatData.map(function(o) { return o.contactId; }).indexOf(userId);

        this.chatData[contactIndex]['status'] = 'offline';
        this.chatData[contactIndex]['last_online'] = 'Last online ' + lastOnline;

        this._renderContacts()
        this._renderContactTitle()
    }

    _findPos(obj) {
        var curtop = 0;
        if (obj.offsetParent) {
            do {
                curtop += obj.offsetTop;
            } while (obj = obj.offsetParent);

            return [curtop];
        }
    }

    _scrollWindowForChat() {
        window.scroll(0, this._findPos(document.getElementById('chatInputCard')));
    }

    _removeFromContact(tutorId) {
        const vm = this;
        const data = new FormData()
        data.append('studentId', Laravel.userId);
        data.append('tutorId', tutorId);

        $.ajax({
            type: 'POST',
            url:  "/api/v1/student/maketutorfavouriteunvaourite",
            data: data,
            processData: false,
            contentType: false,
            success: function () {
                var contactIndex = vm.chatData.map(function(o) { return o.contactId; }).indexOf(tutorId);

                vm.chatData.splice(contactIndex, 1);

                if (vm.chatData.length > 0) {
                    var currentContact = vm.currentChatData.contactId === tutorId ? vm.chatData[0].contactId : null;

                    vm._renderContacts(currentContact);
                } else {
                    document.getElementById('chatCard').classList.add('d-none')
                    document.getElementById('chatInputCard').classList.add('d-none')
                    vm._renderContacts();
                }
            },
            failure: function (response) { console.log('error',response) },
        })
    }

    _fetchAllMessage(senderId) {
        var vm = this;
        return new Promise(function (resolve, reject) {
            if (!vm.alreadyFetchMessages.includes(senderId)) {
                $.ajax({
                    type: 'GET',
                    url:  "/api/v1/chat/get-messages/" + Laravel.userId + '?contactId=' + senderId,
                    processData: false,
                    contentType: false,
                    success: function (response) {
                        resolve(response)
                    },
                    failure: function (response) { reject(response) },
                })
            } else {
                resolve(vm._getDataById(senderId).messages)
            }
        })
    }

    _resetDataMessages(contactId, messages) {
        var contactIndex = this.chatData.map(function(o) { return o.contactId; }).indexOf(contactId);
        this.chatData[contactIndex].messages = messages;

        this.alreadyFetchMessages.push(contactId)
    }

}
