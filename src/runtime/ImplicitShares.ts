import type StructureDefinition from '../nodes/StructureDefinition';
import { VerseType } from '../output/Verse';
import { PhraseType } from '../output/Phrase';
import { GroupType } from '../output/Group';
import { PoseType } from '../output/Pose';
import { StackType } from '../output/Stack';
import { RowType } from '../output/Row';
import { ColorType } from '../output/Color';
import { PlaceType } from '../output/Place';
import { SequenceType } from '../output/Sequence';
import {
    careful,
    cautious,
    elastic,
    erratic,
    fast,
    pokey,
    quick,
    rushed,
    straight,
    wreckless,
    zippy,
    bouncy,
} from '../output/Easing';
import type FunctionDefinition from '../nodes/FunctionDefinition';
import Key from '../streams/Key';

export const PoseTypes = [
    PoseType,
    SequenceType,
    straight,
    pokey,
    fast,
    quick,
    zippy,
    careful,
    cautious,
    rushed,
    wreckless,
    elastic,
    erratic,
    bouncy,
];

export const GroupTypes = [VerseType, GroupType, StackType, RowType];

export const PhraseTypes = [PhraseType, ColorType, PlaceType];

const ImplicitShares: (StructureDefinition | FunctionDefinition)[] = [
    ...PhraseTypes,
    ...GroupTypes,
    ...PoseTypes,
    Key,
];
export default ImplicitShares;
