export const ERROR_UNAUTHORIZED = 'HTTP Status 401 - pz-gateway is unable to authenticate the provided user'

export const ERROR_GENERIC = `{
  "timestamp": 1461978715800,
  "status": 500,
  "error": "Internal Server Error",
  "exception": "java.lang.NullPointerException",
  "message": "No message available",
  "path": "/any/where"
}`

export const RESPONSE_DEPLOYMENT = `{
  "data": {
    "deployment": {
      "capabilitiesUrl": "http://test-capabilities-url/arbitrary/context/path?service=wfs&version=2.0.0&request=GetCapabilities",
      "dataId": "test-data-id",
      "deploymentId": "test-deployment-id",
      "host": "test-host",
      "layer": "test-layer-id",
      "port": "test-port"
    },
    "expiresOn": "test-expires-on"
  }
}`

export const RESPONSE_DEPLOYMENT_NOT_FOUND = `{
  "type": "error",
  "message": "Deployment not found: nopenope",
  "origin": "Access"
}`

export const RESPONSE_FILE = `{
  "foo": "bar"
}`

export const RESPONSE_JOB_CREATED = `{
  "type": "job",
  "data": {
    "jobId": "test-id"
  }
}`

export const RESPONSE_JOB_RUNNING = `{
  "type": "status",
  "data": {
    "result": null,
    "status": "Running",
    "jobType": "ExecuteServiceJob",
    "createdBy": "test-created-by",
    "progress": {},
    "jobId": "test-id"
  }
}`

export const RESPONSE_JOB_SUCCESS = `{
  "type": "status",
  "data": {
    "result": {
      "type": "data",
      "dataId": "test-data-id"
    },
    "status": "Success",
    "jobType": "ExecuteServiceJob",
    "createdBy": "test-created-by",
    "progress": {},
    "jobId": "test-id"
  }
}`

export const RESPONSE_JOB_ERROR = `{
  "type": "status",
  "data": {
    "result": {
      "type": "error",
      "message": "403 Forbidden"
    },
    "status": "Error",
    "jobType": "ExecuteServiceJob",
    "createdBy": "test-created-by",
    "progress": {},
    "jobId": "test-id"
  }
}`

export const RESPONSE_JOB_NOT_FOUND = `{
  "type": "error",
  "message": "Job not found: test-id",
  "origin": "Job Manager"
}`

export const RESPONSE_SERVICE_LIST = `{
  "type": "service-list",
  "data": [
    {
      "serviceId": "test-id-1",
      "url": "test-url",
      "contractUrl": "test-contract-url",
      "method": "POST",
      "resourceMetadata": {
        "name": "test-name",
        "description": "test-description",
        "classType": {
          "classification": "UNCLASSIFIED"
        },
        "version": "test-version"
      }
    },
    {
      "serviceId": "test-id-2",
      "url": "test-url",
      "contractUrl": "test-contract-url",
      "method": "POST",
      "resourceMetadata": {
        "name": "test-name",
        "description": "test-description",
        "availability": "test-availability",
        "classType": {
          "classification": "UNCLASSIFIED"
        },
        "version": "test-version"
      }
    }
  ],
  "pagination": {
    "count": 2,
    "page": 0,
    "per_page": 100
  }
}`
