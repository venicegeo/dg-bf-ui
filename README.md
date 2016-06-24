# bf-ui

User interface for the Beachfront project.

## Installing and Developing

```
$ npm install
$ npm run watch
```

Open browser to `http://localhost:8080`.  Changes will automatically
reload the browser.

## Building

```
npm run build
```

### Environment Variables

| Variable  | Description                                           |
|-----------|-------------------------------------------------------|
| `GATEWAY` | A URL pointing at a specific Piazza Gateway instance. |


## Testing

```
$ npm run lint
$ npm run test
```

## External Dependencies

The UI will attempt to autodiscover the following services via the
Piazza gateway service locator:

- [bf-handle](https://github.com/venicegeo/bf-handle)
- [pzsvc-image-catalog](https://github.com/venicegeo/pzsvc-image-catalog)
