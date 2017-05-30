@Library('pipelib@master') _

node {
    def NODEJS_HOME = tool 'nodejs_7'

    stage('Setup') {
        git([
            url: "https://github.com/venicegeo/dg-bf-ui.git",
            branch: "master"
        ])
    }

    stage('Install Dependencies') {
        withEnv(["PATH+NODE=${NODEJS_HOME}/bin"]) {
            sh """
                npm install
                npm run typings:install
            """
        }
    }

    // stage('Test') {
    //     withEnv(["PATH+NODE=${NODEJS_HOME}/bin"]) {
    //         sh """
    //             npm run test:ci
    //         """
    //     }
    // }

    stage('Archive') {
        withEnv(["PATH+NODE=${NODEJS_HOME}/bin"]) {
            sh '''
                NODE_ENV=production npm run build
                cp nginx.conf dist/

                pushd dist > /dev/null
                zip -r ../coastline.zip .
                popd > /dev/null
            '''
        }
    }

    stage('Deploy') {
        cfPush()
        cfBgDeploy()
    }

    stage ('Cleanup') {
        deleteDir()
    }
}
