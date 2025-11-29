import {
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from '@/components/page-header';
import Pager from '@/components/pager';


const AboutMePage = () => {

  
  return (
    <>
      <PageHeader>
        <PageHeaderHeading>About Amine</PageHeaderHeading>
        <PageHeaderHeading className="mt-2 text-muted-foreground">
          More than just a title - let’s dive deeper!
        </PageHeaderHeading>
        <PageHeaderDescription>
          I am a Software Engineer and Technical Lead focused on building reliable systems that use solid backend design and practical AI to solve real problems. I work across the stack and have experience with microservices, APIs, and multi channel communication platforms. I like taking complex ideas and shaping them into solutions that are straightforward, dependable, and helpful to the people who use them. At Intelswift, I have delivered these systems for major pilots, proving they can support the demands of large clients.              </PageHeaderDescription>

        <PageHeaderDescription>
          I have a strong background in backend engineering and distributed systems, where I focus on making platforms secure, scalable, and easy to maintain. I build server side components that support automation, connect with modern interfaces, and keep data flowing smoothly. My goal is always to create systems that work well behind the scenes so teams and users can rely on them without having to think about how they operate.        </PageHeaderDescription>

        <PageHeaderDescription>
          Beyond coding, I work well in collaborative environments and enjoy leading teams toward clear, impactful outcomes. I like solving challenging architecture and AI problems with practical, creative thinking. My goal is to contribute to products that improve user experiences and deliver real value.        </PageHeaderDescription>
      </PageHeader>

      <Pager
        prevHref="/"
        nextHref="/projects"
        prevTitle="Introduction"
        nextTitle="Projects"
      />
    </>
  );
};
export default AboutMePage;
