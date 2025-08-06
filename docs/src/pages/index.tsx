import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';
import Heading from '@theme/Heading';

import styles from './index.module.css';

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <Heading as="h1" className="hero__title">
          {siteConfig.title}
        </Heading>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <div className={styles.buttons}>
          <Link
            className="button button--secondary button--lg"
            to="/docs/intro">
            Get Started - 5min ⏱️
          </Link>
          <Link
            className="button button--outline button--secondary button--lg"
            to="/docs/examples/nextjs-demo"
            style={{ marginLeft: '1rem' }}>
            Try Interactive Demo
          </Link>
        </div>
      </div>
    </header>
  );
}

export default function Home(): JSX.Element {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout
      title={`Hello from ${siteConfig.title}`}
      description="A TypeScript library for typed attributes and modifiers with deterministic evaluation">
      <HomepageHeader />
      <main>
        <HomepageFeatures />

        {/* Quick Example Section */}
        <section className={styles.features}>
          <div className="container">
            <div className="row">
              <div className="col col--12">
                <div className="text--center padding-horiz--md">
                  <Heading as="h2">Simple yet Powerful</Heading>
                  <p>Build complex modification systems with just a few lines of code</p>
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col col--6">
                <h3>📝 Define Configuration</h3>
                <pre><code>{`const config = defineConfig({
  metrics: ["Health", "Damage"] as const,
  operations: ["sum", "multiply"] as const,
  attributes: [{
    key: "Rarity",
    kind: "enum", 
    values: ["Common", "Epic"] as const
  }] as const,
});`}</code></pre>
              </div>
              <div className="col col--6">
                <h3>⚡ Build & Evaluate</h3>
                <pre><code>{`const sword = engine
  .builder("Epic Sword")
  .set("Rarity", "Epic")
  .increase("Damage").by(100)
  .when({ op: "eq", attr: "Rarity", value: "Epic" })
  .multiply("Damage").by(1.5)
  .build();

const result = engine.evaluate(sword);
// { Health: 0, Damage: 150 }`}</code></pre>
              </div>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}