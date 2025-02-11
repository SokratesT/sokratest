import { InterceptingModal } from "@/app/app/posts/@modal/(.)edit/[id]/_components/intercepting-modal";
import { UploadComponent } from "../../_components/upload-component";

const AddFilePage = () => {
  return (
    <InterceptingModal title="Add File">
      <UploadComponent />
    </InterceptingModal>
  );
};

export default AddFilePage;
