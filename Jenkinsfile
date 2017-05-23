@Library('pipelib') _

node {

  def nodejs = tool 'NodeJS_6'

  stage('Setup') {
    git([
      url: "https://github.com/venicegeo/bf-ui.git",
      branch: "master"
    ])
  }

  stage('Archive') {
    npmSetup()

    withEnv(["PATH+NODE=${nodejs}/bin"]) {
      sh """
        npm install
        ./node_modules/.bin/typings install
        NODE_ENV=production npm run build
        cp nginx.conf dist/

        pushd dist > /dev/null
        zip -r ../beachfront.zip .
        popd > /dev/null
      """
    }

    mavenPush()
  }

  stage('Initial Scans') {
    dependencyCheck() 
    sh """

      # Note: This is a workaround for the fact that SonarQube currently doesn't support
      #       Typescript.  It can be removed once(if?) they release an official plugin
      #       for it.
      # Generate artifacts Sonar can actually parse
      ./node_modules/.bin/tsc

      # Update the coverage report to point to the transpiled sources
      cp report/coverage/lcov.info report/coverage/lcov.info~
      sed -E 's/\\.tsx?\$/.js/' report/coverage/lcov.info~ > report/coverage/lcov.info
    """
    sonar()
  }

  stage ('CI Deploy') {
    cfPush()
    zap()
    cfBgDeploy()
  }

  stage ('Integration Testing') {
    withCredentials([[
      $class: 'UsernamePasswordMultiBinding',
      credentialsId: 'bf_testing_credentials',
      usernameVariable: 'bf_username',
      passwordVariable: 'bf_password',
    ]]) {
      postman {
        postmanRepo 'https://github.com/venicegeo/bftest-integration'
        postmanScript './ci/Postman/beachfront.sh'
      }
    }
  }

  stage('Staging Deploy') {
    cfPush {
      cfTarget = 'stage'
    }
    cfBgDeploy {
      cfTarget = 'stage'
    }
  }

  stage('Final Scans') {
    fortify()
  }

  stage ('Cleanup') {
    deleteDir()
  }
}
