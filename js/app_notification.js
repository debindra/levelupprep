/**
 *
 * chat_notification.js
 *
 * Initialization and overriding of project wide plugins.
 *
 *
 */

 class AppNotification {
    _createHeaderNotificationList(notification) {
        var notifList = `<li class="mb-3 pb-3 border-bottom border-separator-light d-flex">
                <div class="align-self-center">
                ${notification.title}
                </div>
            </li>`

        $('#list-notif').prepend(notifList);
    }
}
