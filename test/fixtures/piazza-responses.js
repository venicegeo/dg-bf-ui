export const ERROR_UNAUTHORIZED = 'HTTP Status 401 - pz-gateway is unable to authenticate the provided user'

export const ERROR_GENERIC = `{
  "timestamp": 1461978715800,
  "status": 500,
  "error": "Internal Server Error",
  "exception": "java.lang.NullPointerException",
  "message": "No message available",
  "path": "/any/where"
}`

export const RESPONSE_FILE = `{
  "foo": "bar"
}`

export const RESPONSE_JOB_CREATED = `{
  "type": "job",
  "jobId": "test-id"
}`

export const RESPONSE_JOB_RUNNING = `{
  "type": "status",
  "jobId": "test-id",
  "status": "Running",
  "jobType": "execute-service",
  "submittedBy": "test-user",
  "progress": {}
}`

export const RESPONSE_JOB_SUCCESS = `{
  "type": "status",
  "jobId": "test-id",
  "result": {
    "type": "data",
    "dataId": "test-data-id"
  },
  "status": "Success",
  "jobType": "execute-service",
  "submittedBy": "test-user",
  "progress": {}
}`

export const RESPONSE_JOB_ERROR = `{
  "type": "status",
  "jobId": "test-id",
  "result": {
    "type": "error",
    "message": "Service not found."
  },
  "status": "Error",
  "jobType": "execute-service",
  "submittedBy": "test-user",
  "progress": {}
}`

export const RESPONSE_JOB_NOT_FOUND = `{
  "type": "error",
  "jobId": "test-id",
  "message": "Job Not Found.",
  "origin": "Job Manager"
}`

export const RESPONSE_SERVICE_LIST = `{
  "type": "service-list",
  "data": [
    {
      "serviceId": "test-id-1",
      "url": "test-url",
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
