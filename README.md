# How to use

## Install

Run the following in your terminal:
`npm install`

## Build

Run the following in your terminal:
`npm run build`

Take required files will be build in the dist folder.

### Options

Options are to be put in the env file.

Defaults used are to aid local testing

Option name | Default | Description
-- | -- | --
APP_DOMAIN | `http://localhost:5500` | The domain of the site the app is on
APP_ROUTE_PATH | `dist` | The route of the app within your domain. (ie. If your app is at https://my.site/my/app, this would be `my/app`.)
ICON_FOLDER | `icons` | The name of the folder you want to put your icons into. This is always assumed to be directly in the route path
ICON_FOCAL_POINT | `center center` | Which part of the image is the most important, using the same syntax as [the CSS `object-position` property](https://developer.mozilla.org/en-US/docs/Web/CSS/object-position).
SITE_NAME | `My site` | The name of your app
SITE_SHORT_NAME | `Site` | A version of your app name that will fit in smaller spaces
ICON_COLOR | `#000000` | The colour of a silhouette version of your icon
THEME_COLOR | `#ffffff` | The primary colour of your app
APPLE_STATUS_BAR_STYLE | `default` | The style of status bar to use on iOS devices ([See more here.](https://developer.apple.com/library/archive/documentation/AppleApplications/Reference/SafariHTMLRef/Articles/MetaTags.html))

### Options

As this gets out of date, or if you need any other types of icons, modify the `icon-definitions.js` file to add any extra files required.

This won’t create any additional meta tags, but it will create icons with the desired name and size.

# TODO

- Allow apple launch icons to use a different image
