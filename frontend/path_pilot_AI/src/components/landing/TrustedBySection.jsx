const brands = ['LINEAR', 'STRIPE', 'VERCEL']

function TrustedBySection() {
  return (
    <section className="trusted-section" aria-label="Trusted companies">
      <p>TRUSTED BY USERS AT</p>
      <div className="brand-list">{brands.map((brand) => <span key={brand}>{brand}</span>)}</div>
    </section>
  )
}

export default TrustedBySection
