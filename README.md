# bf-ui

User interface for the Beachfront project.

## Installing and Developing

```
$ npm install
$ npm run typings:install
$ npm run watch
```

Open browser to `http://localhost:8080`.  Changes will automatically
reload the browser.

## Building

```
npm run build
```

### Environment Variables

| Variable                           | Description                                           |
|------------------------------------|-------------------------------------------------------|
| `GATEWAY`                          | A URL pointing at a specific Piazza Gateway instance. |
| `CLASSIFICATION_BANNER_BACKGROUND` | A color value (e.g., `red`, `green`, `blue`) for the classification banner background. |
| `CLASSIFICATION_BANNER_FOREGROUND` | A color value (e.g., `red`, `green`, `blue`) for the classification banner foreground. |
| `CLASSIFICATION_BANNER_TEXT`       | A text value for the classification banner. |


## Testing

```
$ npm run lint
$ npm run test
$ npm run test:ci  # Will also generate coverage reports
```
