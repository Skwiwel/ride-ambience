# Ride Ambience


A static web app combining YouTube video with radio. It includes a preset playlist and radio list. The playlists can include any kind of videos, but the app was originally intended to include a playlist of a calm ride through some area. The app is designed to provide some background noise while the user is doing some other stuff (kind of like a TV).

While for now there is no UI for modifying the radio and video lists the site saves them on a per user basis along with some other play settings (eg. volume) in cookies.

The app was heavily inspired by [Drive And Listen](https://driveandlisten.herokuapp.com/), but is intended to be customizable by the user (and by the user I mean power-user since modification is, for now, available mostly through code).

It was developed for my own personal use and to refresh my JS and CSS knowledge. Even so, I make the code public for anyone to modify and expand for their own purposes.


## App Demo

I put a container online for a quick demo for anyone to checkout. The hosting is free and is generally not intended to be heavily used. I cannot guarantee the site will always be up.

**[Link to the site](http://ride-ambience-skwiwel.apps.us-east-1.starter.openshift-online.com/)**


## Inner workings

While you may be quite right saying that this is just a glorified YouTube playlist with some radio the site does feature some simple techniques designed to aid in the app's purpose. The video playlist, among other things, shuffles videos based on what was already seen, remembers where the user finished (closed the site) and allows for skipping video intros (based on specified time).

On load, depending on fetch setting, the app tries to fetch the preset playlist (currently some Japan oriented videos and radio stations) and compares it to the user's database stored in cookies. During use the database is updated to include cross-session relevant information. No personal or tracking information is saved.


The app includes a Dockerfile with which a container image with an Nginx server can be built. A [public build at Docker Hub](https://hub.docker.com/r/skwiwel/ride-ambience) is also hooked to the [app's GitHub repo](https://github.com/Skwiwel/ride-ambience) so that the newest version can be easily deployed. The provided Nginx server coniguration listens on port 8081.


## Planned Features

The app's basic functionality is finished, but there are still many features to be added and bugs to be fixed. Among the bigger planned features are these:

- [x] YT video list management through UI
- [ ] Radio Station list management through UI (by the use of the radio-browser API)
- [ ] Individual video and radio volume / start time customization
