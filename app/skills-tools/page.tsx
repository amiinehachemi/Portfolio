import { Icons } from '@/components/icons';
import {
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from '@/components/page-header';
import Pager from '@/components/pager';
import { Badge } from '@/components/ui/badge';
import { mySkills } from '@/constants';

const SkillsToolsPage = () => {
  return (
    <>
      <PageHeader>
        <PageHeaderHeading>Skills & Tools</PageHeaderHeading>
        <PageHeaderHeading className="mt-2 text-muted-foreground">
        Mastered new tools faster than deadlines arrived, since great products do not wait.
        </PageHeaderHeading>
        <PageHeaderDescription>
        I built my skills by working on systems that needed to handle real pressure.
         Over time, I moved from writing small features to shaping the architecture behind a large customer service platform at Intelswift, 
         one used by high value clients like banks and major retailers. Along the way, I learned how to design microservices,
          build reliable APIs, work with vector databases, and use AI frameworks like LangChain to create smarter, 
          faster automation. I still enjoy frontend work when it helps complete the picture,
           but most of my focus goes into making complex systems feel simple, stable, and ready for real world demands.
        </PageHeaderDescription>
      </PageHeader>

      {/* skills and tools badges */}
      <div
        id="badges"
        className="flex flex-wrap items-center justify-center gap-2 my-4"
      >
        {mySkills.map((item) => (
          <Badge
            key={item.title}
            className="p-4 py-2 border border-secondary bg-secondary-foreground text-secondary"
          >
            {Icons[item.icon as keyof typeof Icons]?.({
              className: 'mr-2 size-4',
            })}
            {item.title}
          </Badge>
        ))}
      </div>

      <Pager
        prevHref="/projects"
        nextHref="/experience"
        prevTitle="Projects"
        nextTitle="Experience"
      />
    </>
  );
};
export default SkillsToolsPage;
