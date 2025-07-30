import Image from 'next/image';
import Link from 'next/link';

import { ArrowRightIcon, Phone, Shield, TrendingUp, Users } from 'lucide-react';

import {
  CtaButton,
  FeatureCard,
  FeatureGrid,
  FeatureShowcase,
  FeatureShowcaseIconContainer,
  Hero,
  Pill,
} from '@kit/ui/marketing';
import { Trans } from '@kit/ui/trans';

import { withI18n } from '~/lib/i18n/with-i18n';

function Home() {
  return (
    <div className={'mt-4 flex flex-col space-y-24 py-14'}>
      <div className={'container mx-auto'}>
        <Hero
          pill={
            <Pill label={'AI-Powered'}>
              <span>Voice fundraising platform for charities</span>
            </Pill>
          }
          title={
            <>
              <span>Transform fundraising with</span>
              <span>AI-powered voice calls</span>
            </>
          }
          subtitle={
            <span>
              Henk enables charities to engage donors through natural phone
              conversations at scale. Reduce operational costs while improving
              donor experience and conversion rates.
            </span>
          }
          cta={<MainCallToActionButton />}
          image={
            <Image
              priority
              className={
                'dark:border-primary/10 rounded-2xl border border-gray-200'
              }
              width={3558}
              height={2222}
              src={`/images/dashboard.webp`}
              alt={`Henk AI Dashboard`}
            />
          }
        />
      </div>

      <div className={'container mx-auto'}>
        <div
          className={'flex flex-col space-y-16 xl:space-y-32 2xl:space-y-36'}
        >
          <FeatureShowcase
            heading={
              <>
                <b className="font-semibold dark:text-white">
                  AI-Powered Voice Fundraising
                </b>
                .{' '}
                <span className="text-muted-foreground font-normal">
                  Engage donors through natural conversations at scale with Henk
                  AI.
                </span>
              </>
            }
            icon={
              <FeatureShowcaseIconContainer>
                <Phone className="h-5" />
                <span>Voice AI Platform</span>
              </FeatureShowcaseIconContainer>
            }
          >
            <FeatureGrid>
              <FeatureCard
                className={'relative col-span-2 overflow-hidden'}
                label={'Natural Conversations'}
                description={`Henk uses advanced AI to have natural, engaging phone conversations with donors.`}
              />

              <FeatureCard
                className={
                  'relative col-span-2 w-full overflow-hidden lg:col-span-1'
                }
                label={'CRM Integration'}
                description={`Seamlessly connect with existing donor management systems and workflows.`}
              />

              <FeatureCard
                className={'relative col-span-2 overflow-hidden lg:col-span-1'}
                label={'Compliance First'}
                description={`Built with fundraising regulations and best practices in mind.`}
              />

              <FeatureCard
                className={'relative col-span-2 overflow-hidden'}
                label={'Scalable Architecture'}
                description={`Handle thousands of concurrent calls with intelligent routing and management.`}
              />
            </FeatureGrid>
          </FeatureShowcase>
        </div>
      </div>
    </div>
  );
}

export default withI18n(Home);

function MainCallToActionButton() {
  return (
    <div className={'flex space-x-4'}>
      <CtaButton>
        <Link href={'/auth/sign-up'}>
          <span className={'flex items-center space-x-0.5'}>
            <span>
              <Trans i18nKey={'common:getStarted'} />
            </span>

            <ArrowRightIcon
              className={
                'animate-in fade-in slide-in-from-left-8 h-4' +
                ' zoom-in fill-mode-both delay-1000 duration-1000'
              }
            />
          </span>
        </Link>
      </CtaButton>

      <CtaButton variant={'link'}>
        <Link href={'/contact'}>
          <Trans i18nKey={'common:contactUs'} />
        </Link>
      </CtaButton>
    </div>
  );
}
