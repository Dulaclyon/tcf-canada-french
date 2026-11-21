// Questions have one teaching home. Shared source files do not imply shared practice.
export const pronunciationHomes={'grammar-sounds-basic':'lesson-02','grammar-sounds-glides':'lesson-13'};
export function buildPracticeCatalogue(courses,materials){
 const units=new Map(materials.map(unit=>[unit.id,unit]));
 return [...courses,...materials].flatMap(source=>{
  const home=source.practiceUnit||pronunciationHomes[source.id]||source.id;
  const unit=units.get(home)||source;
  return (source.exercises||[]).map(question=>({...question,course:unit}));
 });
}
