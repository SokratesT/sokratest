const PostsLayout = ({
  children,
  modal,
}: { children: React.ReactNode; modal: React.ReactNode }) => {
  return (
    <>
      {children}
      {modal}
    </>
  );
};

export default PostsLayout;
