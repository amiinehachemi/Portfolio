import {
  PageActions,
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from '@/components/page-header';
import Pager from '@/components/pager';
import { Button } from '@/components/ui/button';
import { siteConfig } from '@/config/site';
import { ExternalLink, Mail } from 'lucide-react';
import Link from 'next/link';

const IntroductionPage = async () => {
  return (
    <>
      <PageHeader>
        <PageHeaderHeading>Amine Hachemi</PageHeaderHeading>
        <PageHeaderHeading className="mt-2 text-muted-foreground">
          Building Scalable AI Solutions And Backend Platforms
        </PageHeaderHeading>
        <PageHeaderDescription>
        For a while now I’ve been leading the technical direction behind a customer service automation platform at Intelswift. My work sits at the intersection of backend architecture and AI, ensuring the systems we build are both powerful and dependable. I work across the full stack with a strong focus on scalable backend systems, including microservices, API design, and backend architecture. I also contribute to frontend interfaces when needed, always aiming for clean design, reliable performance, and smooth communication across components. Along the way, I’ve helped deliver this platform to major pilots and high value clients, making sure it can handle the scale and expectations of large organizations.        </PageHeaderDescription>
        <PageActions>
          <Button asChild size="sm" className="rounded-md">
            <Link href={siteConfig.links.resume} target="_blank">
              Get Resume
              <ExternalLink className="size-3" strokeWidth={2} />
            </Link>
          </Button>
          <Button asChild size="sm" variant="ghost" className="rounded-md">
            <Link href={siteConfig.links.email}>
              <Mail className="size-4" />
              Send Mail
            </Link>
          </Button>
        </PageActions>
      </PageHeader>

      <Pager
        prevHref="/"
        nextHref="/about"
        prevTitle="Previous"
        nextTitle="About Me"
      />
    </>
  );
};
export default IntroductionPage;
