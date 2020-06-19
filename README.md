## sk-notifier ##

A meme program written in GoogleScript that notifies your Discord guild when a new chapter of certain fanfiction is posted.  
That fanfic, speaking precisely, is https://ponyfiction.org/story/6196/  

### Deploy ###
1. Create two Apps Script projects: sk-notifier-task (`sk-notifier-task.gs` and `lib-he.gs`) and sk-notifier-hooks (only `sk-notifier-hooks.gs`).
2. Add time trigger to sk-notifier-task to run it via `run()` repeatedly (10min is good).
3. Publish sk-notifier-hooks as WebApps and set it as accessible for everyone.
4. Set secret key for both scripts: Project properties -> Script properties -> Add new with 'key' as name.
5. Webhooks could be added with POSTing plaintext webhook URL to sk-notifier-hooks.