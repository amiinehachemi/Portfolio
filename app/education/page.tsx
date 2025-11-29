import {
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from '@/components/page-header';
import Pager from '@/components/pager';
import TimelineViewer from '@/components/timeline-viewer';
import { education } from '@/constants/education';

const EducationPage = () => {
  return (
    <>
      <PageHeader className="mb-10">
        <PageHeaderHeading>Education</PageHeaderHeading>
        <PageHeaderHeading className="mt-2 text-muted-foreground">
          I learned a lot, but the real learning happens in the code editor!
        </PageHeaderHeading>
        <PageHeaderDescription>
        Education has played an important role in shaping my path into software development. Before entering the tech field, 
        I completed my Bachelor's in International Law at Université Dr Moulay Tahar de Saida, where I developed strong analytical thinking,
        structured problem solving abilities, and a solid understanding of legal and compliance concepts.
        </PageHeaderDescription>

        <PageHeaderDescription>
        These foundations helped me transition smoothly into the world of development. 
        My shift toward technology has been supported by intensive training programs and hands on projects that strengthened my skills in modern software engineering.
         This combination of legal insight and technical expertise allows me to approach development with precision, clarity, 
        and a strong focus on privacy, security, and responsible handling of data.
        </PageHeaderDescription>
      </PageHeader>

      <TimelineViewer data={education} />

      <Pager
        prevHref="/experience"
        nextHref="/contact"
        prevTitle="Experience"
        nextTitle="Contact"
      />
    </>
  );
};
export default EducationPage;
