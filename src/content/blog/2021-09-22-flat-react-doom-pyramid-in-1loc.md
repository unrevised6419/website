---
title: 🔺 Flat React Doom Pyramid in 1LOC
published: true
tags: react, javascript, typescript
cover_image: kevin-et-laurianne-langlais-H3ugdzHeh2I-unsplash.jpg
---

Everyone was happy when React Team announced the new stable Context API, and everyone ditched Redux. But that's not the point.

After 1 year every codebase entrypoint looked like this at least.

```tsx
<I18nProvider>
	<DataProvider>
		<ActiveDialogProvider>
			<PublicFetchProvider>
				<AuthProvider>
					<PrivateFetchProvider>
						<AuthFetchProvider>
							<CustomThemeProvider>
								<CustomMuiPickersUtilsProvider>
									<LegalsProvider>
										<PaymentMethodsProvider>
											<CartProvider>
												<App />
											</CartProvider>
										</PaymentMethodsProvider>
									</LegalsProvider>
								</CustomMuiPickersUtilsProvider>
							</CustomThemeProvider>
						</AuthFetchProvider>
					</PrivateFetchProvider>
				</AuthProvider>
			</PublicFetchProvider>
		</ActiveDialogProvider>
	</DataProvider>
</I18nProvider>
```

![](https://media.giphy.com/media/yoJC2k4dPDRSInYfjq/giphy.gif)

Soooo, should we do something about this? Most of the times there is no reason. Nevertheless, here is a simple performant solution in 1 line of code

```js
const Pipe = (p) =>
	p.children.reduceRight((c, e) => ({
		...e,
		props: { ...e.props, children: c },
	}));
```

You can name it however you want:

- Flatten
- Compose
- Pipe
- Squash
- Doom 😂
- Nest
- Inflate

And how will look above example? Better!

```jsx
<Pipe>
	<I18nProvider />
	<DataProvider />
	<ActiveDialogProvider />
	<PublicFetchProvider />
	<AuthProvider />
	<PrivateFetchProvider />
	<AuthFetchProvider />
	<CustomThemeProvider />
	<CustomMuiPickersUtilsProvider />
	<LegalsProvider />
	<PaymentMethodsProvider />
	<CartProvider />
	<App />
</Pipe>
```

This function component takes all its children and nests them from first to last, where first one will be the most outside the tree, and the last one will be last in the tree.

Here is one more variation with TypeScript and different API

```tsx
function Flatten(props: PropsWithChildren<{ elements: ReactElement[] }>) {
	const { elements: e, children: init } = props;
	return <>{e.reduceRight((c, e) => cloneElement(e, { children: c }), init)}</>;
}
```

And the usage will be like this:

```tsx
<Flatten
	elements={[
		<I18nProvider />,
		<DataProvider />,
		<ActiveDialogProvider />,
		<PublicFetchProvider />,
		<AuthProvider />,
		<PrivateFetchProvider />,
		<AuthFetchProvider />,
		<CustomThemeProvider />,
		<CustomMuiPickersUtilsProvider />,
		<LegalsProvider />,
		<PaymentMethodsProvider />,
		<CartProvider />,
	]}
>
	<App />
</Flatten>
```

I went through multiple iterations, and in the end I prefer first `Pipe` one liner that I showed.

Sandboxes experiments:

- https://codesandbox.io/s/react-flatten-pyramid-wpr7o
- https://codesandbox.io/s/react-flatten-pyramid-benchs-wgyhf
- https://codesandbox.io/s/react-flatten-pyramid-benchs-clean-o82xw

Thanks for coming to my TED talk! :)

![](https://media.giphy.com/media/QDK1pCI43lGhO/giphy.gif?cid=ecf05e478jdspbhzx3jws7luarz9le5riffo2evh0rp1e5uc&rid=giphy.gif&ct=g)

Cover Photo by <a href="https://unsplash.com/@laukev?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Kévin et Laurianne Langlais</a> on <a href="https://unsplash.com/?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Unsplash</a>
