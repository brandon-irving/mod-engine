import type { ReactNode } from 'react';
import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

type FeatureItem = {
  title: string;
  Svg: React.ComponentType<React.ComponentProps<'svg'>>;
  description: ReactNode;
  viewBox?: string;
};

const FeatureList: FeatureItem[] = [
  {
    title: '🎯 Type-Safe',
    Svg: require('@site/static/img/moddy_vscode.svg').default,
    viewBox: '0 0 1536 1024',
    description: (
      <>
        Full TypeScript support with intelligent autocompletion and compile-time validation.
        Catch errors early and build with confidence.
      </>
    ),
  },
  {
    title: '🔧 Flexible',
    Svg: require('@site/static/img/moddy2.svg').default,
    viewBox: '0 0 1024 1024',
    description: (
      <>
        Support for complex conditions, priorities, and stacking rules.
        Build simple systems or complex RPG mechanics with the same API.
      </>
    ),
  },
  {
    title: '⚡ Performance',
    Svg: require('@site/static/img/moddy_driving.svg').default,
    viewBox: '0 0 1536 1024',
    description: (
      <>
        Optimized evaluation engine with minimal overhead. Handle complex modifier
        systems without sacrificing performance.
      </>
    ),
  },

];

function Feature({ title, Svg, description, viewBox }: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <Svg
          className={styles.featureSvg}
          role="img"
          preserveAspectRatio="xMidYMid meet"
          viewBox={viewBox}
          focusable="false"
        />
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): ReactNode {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
