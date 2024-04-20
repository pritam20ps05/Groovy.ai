gsap.to('.right-side', {
  transform: "translateY(0px)",
  opacity: 1,
  duration: 1,
  scrub: 1
})

gsap.to('.main-title #one',{
  transform: "translateX(0px)",
  opacity: 1,
  duration: 0.875,
  delay: 0.9,
  scrub: 1
})

gsap.to('.main-title #two',{
  opacity: 1,
  duration: 0.875,
  delay:1.9
})

gsap.to('.left-side .main-info',{
  transform: "translateY(0px)",
  opacity: 0.7,
  duration: 0.875,
  delay: 2.2
})

gsap.to('.btn-grp #getst',{
  opacity: 1,
  duration: 0.85,
  delay: 2.4
})

gsap.to('.btn-grp #docs',{
  opacity: 1,
  duration: 0.85,
  delay: 2.8
})

gsap.to('.star',{
  opacity: 1,
  transform: "rotate(0deg) translateX(0px) scale(1)",
  duration: 0.6,
  delay: 3.2
})

gsap.to('.second-page h2', {
  opacity: 1,
  transform: "translateX(0px) translateY(0px)",
  duration: 0.875,
  scrollTrigger: {
      trigger: ".second-page #subtitle",
      scroller: "body"
  }
})

gsap.to('.second-page #subtitle',{
  opacity: 1,
  transform: "translateX(0px)",
  delay: 0.4,
  duration: 0.875,
  scrollTrigger: {
      trigger: ".second-page #subtitle",
      scroller: "body"
  }
})

gsap.to('.line-slider',{
  width: "60%",
  duration: 2,
  delay: 0.8,
  scrollTrigger: {
    trigger: ".line-slider",
    scroller: "body",
    scrub: 1
  }
})

gsap.to('#f-one',{
  transform: "translateY(0px) scale(1)",
  opacity: 1,
  duration: 1,
  delay: 1,
  scrollTrigger: {
    trigger: '#f-one',
    sroller: "body",
    scrub: 1
  }
})

gsap.to('#f-two',{
  transform: "translateY(0px) scale(1)",
  opacity: 1,
  duration: 1,
  delay: 1,
  scrollTrigger: {
    trigger: '#f-two',
    sroller: "body",
    scrub: 1
  }
})