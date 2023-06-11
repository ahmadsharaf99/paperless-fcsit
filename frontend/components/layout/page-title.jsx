import Head from 'next/head';
const PageHeader = (props) => {
  return (
    <>
      <Head>
        <title>{props.title}</title>
      </Head>
      <section
        className={`d-flex justify-content-between align-items-center my-3`}
      >
        <div>
          <h5 className="mb-1">{props.title}</h5>
          <p className="mt-0 form-text">{props.description}</p>
        </div>
        <div>{props.children}</div>
      </section>
    </>
  );
};
export default PageHeader;
