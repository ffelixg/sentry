import {Fragment} from 'react';

import ExternalLink from 'sentry/components/links/externalLink';
import Link from 'sentry/components/links/link';
import {Layout, LayoutProps} from 'sentry/components/onboarding/gettingStartedDoc/layout';
import {ModuleProps} from 'sentry/components/onboarding/gettingStartedDoc/sdkDocumentation';
import {StepType} from 'sentry/components/onboarding/gettingStartedDoc/step';
import {PlatformOption} from 'sentry/components/onboarding/gettingStartedDoc/types';
import {useUrlPlatformOptions} from 'sentry/components/onboarding/platformOptionsControl';
import {t, tct} from 'sentry/locale';

export enum PackageManager {
  GRADLE = 'gradle',
  MAVEN = 'maven',
}

type PlatformOptionKey = 'packageManager';

interface StepsParams {
  dsn: string;
  packageManager: PackageManager;
  organizationSlug?: string;
  projectSlug?: string;
  sourcePackageRegistries?: ModuleProps['sourcePackageRegistries'];
}

// Configuration Start
const platformOptions: Record<PlatformOptionKey, PlatformOption> = {
  packageManager: {
    label: t('Package Manager'),
    items: [
      {
        label: t('Gradle'),
        value: PackageManager.GRADLE,
      },
      {
        label: t('Maven'),
        value: PackageManager.MAVEN,
      },
    ],
  },
};

const introduction = (
  <p>
    {tct(
      'The sentry-logback library provides Logback support for Sentry using an [link:Appender] that sends logged exceptions to Sentry.',
      {
        link: (
          <ExternalLink href="https://logback.qos.ch/apidocs/ch/qos/logback/core/Appender.html" />
        ),
      }
    )}
  </p>
);

export const steps = ({
  dsn,
  sourcePackageRegistries,
  projectSlug,
  organizationSlug,
  packageManager,
}: StepsParams): LayoutProps['steps'] => [
  {
    type: StepType.INSTALL,
    description: t(
      "Install Sentry's integration with Logback using %s:",
      packageManager === PackageManager.GRADLE ? 'Gradle' : 'Maven'
    ),
    configurations: [
      {
        description: (
          <p>
            {tct(
              'To see source context in Sentry, you have to generate an auth token by visiting the [link:Organization Auth Tokens] settings. You can then set the token as an environment variable that is used by the build plugins.',
              {
                link: <Link to="/settings/auth-tokens/" />,
              }
            )}
          </p>
        ),
        language: 'bash',
        code: 'SENTRY_AUTH_TOKEN=___ORG_AUTH_TOKEN___',
      },
      ...(packageManager === PackageManager.GRADLE
        ? [
            {
              description: (
                <p>
                  {tct(
                    'The [link:Sentry Gradle Plugin] automatically installs the Sentry SDK as well as available integrations for your dependencies. Add the following to your [code:build.gradle] file:',
                    {
                      code: <code />,
                      link: (
                        <ExternalLink href="https://github.com/getsentry/sentry-android-gradle-plugin" />
                      ),
                    }
                  )}
                </p>
              ),
              language: 'groovy',
              code: `
buildscript {
  repositories {
    mavenCentral()
  }
}

plugins {
  id "io.sentry.jvm.gradle" version "${
    sourcePackageRegistries?.isLoading
      ? t('\u2026loading')
      : sourcePackageRegistries?.data?.['sentry.java.android.gradle-plugin']?.version ??
        '3.12.0'
  }"
}

sentry {
  // Generates a JVM (Java, Kotlin, etc.) source bundle and uploads your source code to Sentry.
  // This enables source context, allowing you to see your source
  // code as part of your stack traces in Sentry.
  includeSourceContext = true

  org = "${organizationSlug}"
  projectName = "${projectSlug}"
  authToken = System.getenv("SENTRY_AUTH_TOKEN")
}
          `,
            },
          ]
        : []),
      ...(packageManager === PackageManager.MAVEN
        ? [
            {
              language: 'xml',
              partialLoading: sourcePackageRegistries?.isLoading,
              description: (
                <p>
                  {tct(
                    'The [link:Sentry Maven Plugin] automatically installs the Sentry SDK as well as available integrations for your dependencies. Add the following to your [code:pom.xml] file:',
                    {
                      code: <code />,
                      link: (
                        <ExternalLink href="https://github.com/getsentry/sentry-maven-plugin" />
                      ),
                    }
                  )}
                </p>
              ),
              code: `<build>
  <plugins>
    <plugin>
      <groupId>io.sentry</groupId>
      <artifactId>sentry-maven-plugin</artifactId>
      <version>${
        sourcePackageRegistries?.isLoading
          ? t('\u2026loading')
          : sourcePackageRegistries?.data?.['sentry.java.maven-plugin']?.version ??
            '0.0.4'
      }</version>
      <extensions>true</extensions>
      <configuration>
        <!-- for showing output of sentry-cli -->
        <debugSentryCli>true</debugSentryCli>

        <org>${organizationSlug}</org>

        <project>${projectSlug}</project>

        <!-- in case you're self hosting, provide the URL here -->
        <!--<url>http://localhost:8000/</url>-->

        <!-- provide your auth token via SENTRY_AUTH_TOKEN environment variable -->
        <authToken>\${env.SENTRY_AUTH_TOKEN}</authToken>
      </configuration>
      <executions>
        <execution>
          <goals>
            <!--
            Generates a JVM (Java, Kotlin, etc.) source bundle and uploads your source code to Sentry.
            This enables source context, allowing you to see your source
            code as part of your stack traces in Sentry.
            -->
            <goal>uploadSourceBundle</goal>
          </goals>
        </execution>
      </executions>
    </plugin>
  </plugins>
  ...
</build>`,
            },
          ]
        : []),
    ],
    additionalInfo: (
      <p>
        {tct(
          'If you prefer to manually upload your source code to Sentry, please refer to [link:Manually Uploading Source Context].',
          {
            link: (
              <ExternalLink href="https://docs.sentry.io/platforms/java/source-context/#manually-uploading-source-context" />
            ),
          }
        )}
      </p>
    ),
  },
  {
    type: StepType.CONFIGURE,
    description: t(
      "Configure Sentry as soon as possible in your application's lifecycle:"
    ),
    configurations: [
      {
        language: 'xml',
        description: t(
          'The following example configures a ConsoleAppender that logs to standard out at the INFO level, and a SentryAppender that logs to the Sentry server at the ERROR level. This only an example of a non-Sentry appender set to a different logging threshold, similar to what you may already have in your project.'
        ),
        code: `
<configuration>
  <!-- Configure the Console appender -->
  <appender name="Console" class="ch.qos.logback.core.ConsoleAppender">
    <encoder>
      <pattern>%d{HH:mm:ss.SSS} [%thread] %-5level %logger{36} - %msg%n</pattern>
    </encoder>
  </appender>

  <!-- Configure the Sentry appender, overriding the logging threshold to the WARN level -->
  <appender name="Sentry" class="io.sentry.logback.SentryAppender">
    <options>
      <dsn>${dsn}</dsn>
    </options>
  </appender>

  <!-- Enable the Console and Sentry appenders, Console is provided as an example
  of a non-Sentry logger that is set to a different logging threshold -->
  <root level="INFO">
    <appender-ref ref="Console" />
    <appender-ref ref="Sentry" />
  </root>
</configuration>
        `,
        additionalInfo: (
          <p>
            {tct(
              "You'll also need to configure your DSN (client key) if it's not already in the [code:logback.xml] configuration. Learn more in [link:our documentation for DSN configuration].",
              {
                code: <code />,
                link: (
                  <ExternalLink href="https://docs.sentry.io/platforms/java/guides/logback/#dsn-configuration/" />
                ),
              }
            )}
          </p>
        ),
      },
      {
        description: (
          <p>
            {tct(
              "Next, you'll need to set your log levels, as illustrated here. You can learn more about [link:configuring log levels] in our documentation.",
              {
                link: (
                  <ExternalLink href="https://docs.sentry.io/platforms/java/guides/logback/#minimum-log-level/" />
                ),
              }
            )}
          </p>
        ),
        configurations: [
          {
            language: 'xml',
            code: `
<appender name="Sentry" class="io.sentry.logback.SentryAppender">
  <options>
    <dsn>${dsn}</dsn>
  </options>
  <!-- Optionally change minimum Event level. Default for Events is ERROR -->
  <minimumEventLevel>WARN</minimumEventLevel>
  <!-- Optionally change minimum Breadcrumbs level. Default for Breadcrumbs is INFO -->
  <minimumBreadcrumbLevel>DEBUG</minimumBreadcrumbLevel>
</appender>
          `,
          },
        ],
      },
    ],
  },
  {
    type: StepType.VERIFY,
    description: t(
      'Last, create an intentional error, so you can test that everything is working:'
    ),
    configurations: [
      {
        language: 'java',
        code: [
          {
            language: 'java',
            label: 'Java',
            value: 'java',
            code: `
import java.lang.Exception;
import io.sentry.Sentry;

try {
  throw new Exception("This is a test.");
} catch (Exception e) {
  Sentry.captureException(e);
}`,
          },
          {
            language: 'java',
            label: 'Kotlin',
            value: 'kotlin',
            code: `
import java.lang.Exception
import io.sentry.Sentry

try {
  throw Exception("This is a test.")
} catch (e: Exception) {
  Sentry.captureException(e)
}`,
          },
        ],
      },
    ],
    additionalInfo: (
      <Fragment>
        <p>
          {t(
            "If you're new to Sentry, use the email alert to access your account and complete a product tour."
          )}
        </p>
        <p>
          {t(
            "If you're an existing user and have disabled alerts, you won't receive this email."
          )}
        </p>
      </Fragment>
    ),
  },
  {
    title: t('Other build tools'),
    additionalInfo: (
      <p>
        {tct('For other dependency managers see the [link:central Maven repository].', {
          link: (
            <ExternalLink href="https://search.maven.org/artifact/io.sentry/sentry-logback" />
          ),
        })}
      </p>
    ),
  },
];

export const nextSteps = [
  {
    id: 'examples',
    name: t('Examples'),
    description: t('Check out our sample applications.'),
    link: 'https://github.com/getsentry/sentry-java/tree/main/sentry-samples',
  },
];
// Configuration End

export function GettingStartedWithLogBack({
  dsn,
  sourcePackageRegistries,
  projectSlug,
  organization,
  ...props
}: ModuleProps) {
  const optionValues = useUrlPlatformOptions(platformOptions);
  const nextStepDocs = [...nextSteps];

  return (
    <Layout
      steps={steps({
        dsn,
        sourcePackageRegistries,
        projectSlug: projectSlug ?? '___PROJECT_SLUG___',
        organizationSlug: organization?.slug ?? '___ORG_SLUG___',
        packageManager: optionValues.packageManager as PackageManager,
      })}
      nextSteps={nextStepDocs}
      introduction={introduction}
      platformOptions={platformOptions}
      projectSlug={projectSlug}
      {...props}
    />
  );
}

export default GettingStartedWithLogBack;
