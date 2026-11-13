@Library('piper-lib-os') _

pipeline {
	agent {
		label 'sapui5nodejs24'
	}
	environment {
		SAP_GATEWAY_AUTH = credentials('sapui5ci-ci-ng7-credentials-jenkins-ui5')
		GIT_AUTH = credentials('sapui5ci-ci-gitea-credentials-jenkins-ui5')
		GIT_REGISTRY_AUTH = credentials('sapui5ci-ci-gitea-npmregistry-token-jenkins-ui5')
		PROXY_AUTH = credentials('sapui5ci-ci-proxy-credentials-jenkins-ui5')
		PIPER_proxy = "http://${PROXY_AUTH_USR}:${PROXY_AUTH_PSW}@proxy.wgs.wuerth.com:3128/"
		TMS_SECRET = credentials('sapui5ci-ci-btp-wit-devops-service-key-credentials-secret-jenkins-ui5')
		UI5_DEPLOYMENT_TARGET = 'NG7'
		TOOLSUITE_FEATURES = 'sap.ux.enablePatchProxy'
		SAP_CF_DEV_AUTH = credentials('sapui5ci-ci-btp-cf-credentials-jenkins-ui5')
		SAP_CF_DEV_HOST = 'https://api.cf.eu10-004.hana.ondemand.com'
		SAP_CF_DEV_ORG_NAME = 'wuerth-it-apps-dev'
		SAP_CF_DEV_SPACE = 'ui5'
		SAP_CF_DEV_ORIGIN = 'axo8ajdqd-platform'
	}
	stages {
		stage('Environment') {
			steps {
				script {
					openshift.withCluster('openshift') {
						openshift.withProject() {
							sh "node --version"
							sh "npm --version"
							sh "printenv | sort | grep 'CI\\|GIT\\|BRANCH'"
						}
					}
				}
			}
		} // end stage
		stage('Prepare') {
			steps {
				script {
					openshift.withCluster('openshift') {
						openshift.withProject() {
							echo "Preparing runtime ..."
							// configure npm registry and login
							sh '''
								npm config set registry ${NPM_REGISTRY_NPMJS}
								npm config set @wui:registry ${NPM_REGISTRY_GITEA}
								npm config set -- '//gitea.wgn.wuerth.com/api/packages/UI5/npm/:_authToken' $GIT_REGISTRY_AUTH_PSW

								PROXY_URL=http://${PROXY_AUTH_USR}:${PROXY_AUTH_PSW}@proxy.wgs.wuerth.com:3128/
								npm config --local set proxy $PROXY_URL
								
								git config --local user.email "jenkins-ui5@dev.null"
								git config --local user.name "jenkins-ui5"
								git config --local push.default simple
							'''
							setupCommonPipelineEnvironment script:this
						}
					}
				}
			}
		} // end stage
		stage('Installing') {
			steps {
                script {
                    openshift.withCluster('openshift') {
                        openshift.withProject() {
                            echo "Installing ..."
                            sh "npm ci"
                            sh "npm install @wui/eslint-plugin-deprecated-api-plugin"
                            sh "npm install eslint-xml-parser"
                            sh "npm install eslint-formatter-sonarqube"
                        }
                    }
                }
            }
        } // end stage
        stage('Validating') {
            steps {
                script {
                    openshift.withCluster('openshift') {
                        openshift.withProject() {
                            echo "Validating ..."
                            // get deprecated index from https://sapui5.hana.ondemand.com/1.120.26/docs/api/api-index-deprecated.json
                            def deprecatedIndex = sh(script: 'curl -s \"https://sapui5.hana.ondemand.com/1.108.51/docs/api/api-index-deprecated.json\"', returnStdout: true)
                            writeJSON file: './node_modules/@wui/eslint-plugin-deprecated-api-plugin/lib/rules/deprecated-index.json', json: deprecatedIndex
                            sh "npm run lint -- --quiet"

                            // deprecated check        
                            echo "Deprecated API check ..."
                            sh "npx eslint -c eslint-ui5-deprecated-api-check.config.js --no-error-on-unmatched-pattern -o ./log/eslint.log -f eslint-formatter-sonarqube './webapp/**/*.js' './webapp/**/*.xml' || true"

                            // declare issuesJson to use after try-catch
                            def issuesJson
                            // declare repo to use after try-catch
                            def repo
                            try {
                                def packageJson = readJSON file: 'package.json'
                                def emailRecipients = []
                                if (packageJson.containsKey('contributors')) {
                                    def packageJsonContributors = packageJson.contributors
                                    for (value in packageJsonContributors) {
                                        def matcher = value =~ '(?<=<).*@wuerth.*(?=>)'
                                        if (matcher) {
                                            // Email recipients
                                            emailRecipients.add(matcher[0])
                                        }                 
                                    }                                 
                                }

                                // remove error/warnings from eslint.log where ruleid equals null
                                issuesJson = readJSON file: 'log/eslint.log'
                                issuesJson.issues.each {issue ->
                                    if (issue.ruleId.equals(null)) {
                                        issue.ruleId = "@wui/deprecated-api-plugin/deprecated_check"
                                        issue.primaryLocation.textRange.startLine = 1
                                    }
                                }
                                // write back to file
                                writeJSON file: 'log/eslint.log', json: issuesJson

                                /*
                                    can be installed if SonarQube (Developer Edition) is used in DEV Check
                                */
                                // def scannerHome = tool name: 'deprecated-check-sonarscanner', type: 'hudson.plugins.sonar.SonarRunnerInstallation';
                                // get repo name
                                repo = ("$GIT_URL" =~ '[^/]+(?=.git)')[0]

                                // retrieve version from package.json
                                def version
                                if (packageJson.containsKey('version')) {
                                    version = packageJson.version                             
                                }
                                /*
                                    can be installed if SonarQube (Developer Edition) is used in DEV Check
                                */
                                // scan project
                                // if (scannerHome) {
                                //  withSonarQubeEnv('deprecated-check-sonarqube') {                                      
                                //      sh "${scannerHome}/bin/sonar-scanner -D\"sonar.projectKey=${repo}\" -D\"sonar.projectVersion=${version}\" -D\"sonar.links.scm=${GIT_URL}\" -D\"sonar.links.ci=${BUILD_URL}\" -D\"sonar.projectDescription=Checked against UI5-version: see Jenkinsfile\""
                                //  }
                                // }  

                                // send email
                                if (issuesJson.issues.size() > 0) {
                                    emailext body: "In the repository <b>${repo}</b> (${GIT_URL}), uses of obsolete features were detected during the deprecated check (checked version: see Jenkinsfile).<br> <b>Be Aware:</b> The functionality of the app can be impaired in the future. <br><br> The Check was triggered automatically by a commit or pull request. <br><br> Jenkins Build: $RUN_DISPLAY_URL <br><br> <i>This E-Mail is auto-generated. Please don\'t reply.</i>", recipientProviders: [developers()], to: emailRecipients.join(' '), subject: "Check failed for ${repo}"
                                } 
                                // archive issues
                                archiveArtifacts 'log/eslint.log'
                            } catch (Exception e) {
                                echo "Deprecated API check failed."
                            }
                            // fail build when issues are found + print them to console --> have to be outside of try-catch                        
                            if (issuesJson.issues.size() > 0) {
                                def issueText = "Deprecated Check found something. Have a look at the generated build artifacts \"log/eslint.log\"\n"
                                issuesJson.issues.each {issue ->
                                    issueText = issueText + "\"$issue.primaryLocation.message\" in $issue.primaryLocation.filePath at line $issue.primaryLocation.textRange.startLine\n"
                                }
                                /*
                                    can be installed if SonarQube (Developer Edition) is used in DEV Check
                                */
                                // error("Deprecated Check found something. Have a look at ${SONARQUBE_URL}/project/issues?id=${repo}&resolved=false")
                                error("$issueText")
                            }
                        }
                    }
                }
            }
        } // end stage
		stage('Building') {
			steps {
				script {
					openshift.withCluster('openshift') {
						openshift.withProject() {
							echo "Building ..."
							if (env.UI5_DEPLOYMENT_TARGET != 'CF') {
								sh "npm run build:abap"
							} else {
								sh "npm run build:mta"
							}
						}
					}
				}
			}
		} // end stage
		stage('Test execution') {
			steps {
				script {
					openshift.withCluster('openshift') {
						openshift.withProject() {
							echo "Testing ..."
							sh "npm run test:ci"
						}
					}
				}
			}
		} // end stage
		stage('Publishing - Check') {
			steps {
				script {
					openshift.withCluster('openshift') {
						openshift.withProject() {
							echo "Publishing - Check"
							sh("npm publish --dry-run")
						}
					}
				}
			}
		} // end stage
		stage('Publishing - Push') {
			when {
				expression { GIT_BRANCH ==~ /release.*/ }
			}
			steps {
				script {
					try{
						openshift.withCluster('openshift') {
							openshift.withProject() {
								echo "Publishing - Push"
								sh("npm publish")
							}
						}
					} catch (e) {
						openshift.withCluster('openshift') {
							openshift.withProject() {
								echo "Publishing failed!"
							}
						}
					}
				}
			}
		} // end stage
		stage('Tagging - Development') {
			when {
				expression { GIT_BRANCH ==~ /(main|master)$/ }
			}
			steps {
				script {
					try {
						openshift.withCluster('openshift') {
							openshift.withProject() {
								echo "Try tagging ..."
								sh('''#!/bin/bash
									v=$(cut -d "=" -f 2 <<< $(npm run env | grep "npm_package_version"))
									git config --local credential.helper "!f() { echo username=\\$GIT_AUTH_USR; echo password=\\$GIT_AUTH_PSW; }; f"
									git tag -a dev-v$v -m "$v"
									git push --tags --force
								''')
							}
						}
					} catch (e) {
						openshift.withCluster('openshift') {
							openshift.withProject() {
								echo "Tagging dev failed!"
							}
						}
					}
				}
			}
		} // end stage
		stage('Tagging - Release') {
			when {
				expression { GIT_BRANCH ==~ /release.*/ }
			}
			steps {
				script {
					try {
						openshift.withCluster('openshift') {
							openshift.withProject() {
								echo "Try tagging ..."
								sh('''#!/bin/bash
									v=$(cut -d "=" -f 2 <<< $(npm run env | grep "npm_package_version"))
									git config --local credential.helper "!f() { echo username=\\$GIT_AUTH_USR; echo password=\\$GIT_AUTH_PSW; }; f"
									git tag -a rel-v$v -m "$v"
									git push --tags --force
								''')
							}
						}
						} catch (e) {
							openshift.withCluster('openshift') {
							openshift.withProject() {
								echo "Tagging rel failed!"
							}
						}
					}
				}
			}
		} // end stage
		stage('Deployment test'){
			when {
				expression { GIT_BRANCH ==~ /PR-.*/ }
			}
			steps {
				script {
					openshift.withCluster('openshift') {
						openshift.withProject() {
							SAP_GATEWAY_AUTH = credentials('sapui5ci-ci-ng7-credentials-jenkins-ui5')
							sh('''#!/bin/bash
								npm run deploy-test:abap -- ng7
								''')
						}
					}
				}
			}
		}
		stage('Deployment - On-Premise') {
			when {
				expression { GIT_BRANCH ==~ /release.*/ }
			}
			steps {
				script {
					openshift.withCluster('openshift') {
						openshift.withProject() {
							echo "Deploying ..."
							if (env.UI5_DEPLOYMENT_TARGET == 'NG7') {
								environment {
									SAP_GATEWAY_AUTH = credentials('sapui5ci-ci-ng7-credentials-jenkins-ui5')
								}					
								sh "npm run deploy:abap -- ng7"
							} else if (env.UI5_DEPLOYMENT_TARGET == 'CXD') {
								environment {
									SAP_GATEWAY_AUTH = credentials('sapui5ci-ci-cxd-credentials-jenkins-ui5')
								}
								sh "npm run deploy:abap -- cxd"
							} else if (env.UI5_DEPLOYMENT_TARGET == 'WSD') {
								environment {
									SAP_GATEWAY_AUTH = credentials('sapui5ci-ci-wsd-credentials-jenkins-ui5')
								}
								sh "npm run deploy:abap -- wsd"
							} else if (env.UI5_DEPLOYMENT_TARGET == 'TM1') {
								environment {
									SAP_GATEWAY_AUTH = credentials('sapui5ci-ci-tm1-credentials-jenkins-ui5')
								}
								sh "npm run deploy:abap: -- tm1"
							}
						}
					}
				}
			}
		}
		stage('Deployment - Cloud Foundry') {
			when {
				expression { GIT_BRANCH ==~ /(main|master)$/ }
			}
			steps {
				script {
					openshift.withCluster('openshift') {
						openshift.withProject() {
							echo "Deploying ..."
							if (env.UI5_DEPLOYMENT_TARGET == 'CF') {
								sh "npm run login-dev:cf"
								sh "npm run deploy:cf"
							}
						}
					}
				}
			}
		}
		// end stage
		stage('Releasing - Cloud Foundry'){
			when {
				expression { GIT_BRANCH ==~ /release.*/  && env.UI5_DEPLOYMENT_TARGET == 'CF' }
			}
			steps {
				script {
					openshift.withCluster('openshift') {
						openshift.withProject() {
							tmsUpload script: this
						}
					}
				}
			}
		}
		// end stage
	}
}