import mongoose, { Document, Model, Schema } from "mongoose";

// Interface for Course schema, defining the structure of a course document.
interface ICourse extends Document {
  name: string;
  description: string;
  price: number;
  estimatedPrice?: number;
  thumbnail: object;
  tags: string;
  level: string;
  demoUrl: string;
  benefits: { title: string }[];
  prerequisites: { title: string }[];
  reviews: IReview[];
  courseData: ICourseData[];
  ratings?: number;
  purchaseCount?: number;
}

// Interface for course content such as videos, descriptions, and extra materials.
interface ICourseData extends Document {
  title: string;
  description: string;
  videoUrl: string;
  videoThumbnail: object;
  videoSection: string;
  videoDuration: number;
  videoPlayer: string;
  links: ILink[];
  suggestion: string;
  question: IComment[];
}

// Interface for user comments on courses and video sections.
interface IComment extends Document {
  user: object;
  comment: string;
  commentReplies?: IComment[];
}

// Interface for course reviews
interface IReview extends Document {
  user: object;
  rating: number;
  comment: string;
  commentReplies: IComment[];
}

// Interface for external resource links related to course materials
interface ILink extends Document {
  title: string;
  url: string;
}

// Schema for user reviews of a course
const reviewSchema = new Schema<IReview>({
  user: Object,
  rating: {
    type: Number,
    default: 0,
  },
  comment: String,
});

// Schema for links related to course materials
const linkSchema = new Schema<ILink>({
  title: String,
  url: String,
});

// Schema for user comments on courses and videos
const commentSchema = new Schema<IComment>({
  user: Object,
  comment: String,
  commentReplies: [Object],
});

// Schema for course content including videos, descriptions, and additional resources
const courseDataSchema = new Schema<ICourseData>({
  videoUrl: String,
  title: String,
  videoSection: String,
  description: String,
  videoDuration: Number,
  videoPlayer: String,
  links: [linkSchema],
  question: [commentSchema],
  suggestion: String,
});

// Main Course schema defining the structure of a course document in MongoDB
const courseSchema = new Schema<ICourse>({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  estimatedPrice: {
    type: Number,
    required: false,
  },
  thumbnail: {
    public_id: {
      // required: true,
      type: String,
    },
    url: {
      // required: true,
      type: String,
    },
  },
  tags: {
    type: String,
    required: true,
  },
  level: {
    type: String,
    required: true,
  },
  demoUrl: {
    type: String,
    required: true,
  },
  benefits: [{ title: String }],
  prerequisites: [{ title: String }],
  reviews: [reviewSchema],
  courseData: [courseDataSchema],
  ratings: {
    type: Number,
    default: 0,
  },
  purchaseCount: {
    type: Number,
    default: 0,
  },
});

// Create the Course model
const CourseModel: Model<ICourse> = mongoose.model("Course", courseSchema);
export default CourseModel;
