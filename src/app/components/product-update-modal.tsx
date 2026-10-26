"use client";

import { X, ChevronDown, ChevronUp, Plus, Minus, Check } from "lucide-react";

export default function ProductUpdateModal(props: any) {
  const {
    productUpdateModal,
    id,
    categories,
    categoryOptions,
    category,
    setCategory,
    name,
    setName,
    price,
    setPrice,
    discount,
    setDiscount,
    currency,
    setCurrency,
    description,
    setDescription,
    images,
    setImages,
    specifications,
    setSpecifications,
    options,
    setOptions,
    active,
    setActive,
    updateProduct,
    closeProductUpdateModal,
  } = props;

  function addImage() {
    setImages([...images, { url: "" }]);
  }

  function updateImage(index: number, value: string) {
    setImages(images.toSpliced(index, 1, { ...images[index], url: value }));
  }

  function removeImage(index: number) {
    setImages(
      images[index].id
        ? images.toSpliced(index, 1, { ...images[index], remove: true })
        : images.toSpliced(index, 1),
    );
  }

  function addSpecification() {
    setSpecifications([...specifications, { attribute: "", value: "" }]);
  }

  function updateSpecification(
    index: number,
    property: "attribute" | "value",
    value: string,
  ) {
    setSpecifications(
      specifications.toSpliced(index, 1, {
        ...specifications[index],
        [property]: value,
      }),
    );
  }

  function removeSpecification(index: number) {
    setSpecifications(
      specifications[index].id
        ? specifications.toSpliced(index, 1, {
            ...specifications[index],
            remove: true,
          })
        : specifications.toSpliced(index, 1),
    );
  }

  function addOption() {
    setOptions([
      ...options,
      { attribute: options[0].attribute, value: "", sku: "", stock: "" },
    ]);
  }

  function updateOption(
    index: number,
    property: "attribute" | "value" | "sku" | "stock",
    value: string,
  ) {
    setOptions(
      property === "attribute"
        ? options.map((variant: any) => ({ ...variant, attribute: value }))
        : options.toSpliced(index, 1, { ...options[index], [property]: value }),
    );
  }

  function removeOption(index: number) {
    setOptions(
      options[index].id
        ? options.toSpliced(index, 1, { ...options[index], remove: true })
        : options.toSpliced(index, 1),
    );
  }

  if (!productUpdateModal || !id) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xl">
      <div className="flex h-full w-full flex-col border border-[#1a1a1a] bg-black lg:h-auto lg:max-h-[75vh] lg:w-auto lg:max-w-[75vw]">
        <div className="flex items-center justify-between gap-4 border-b border-[#1a1a1a] bg-[#0d0d0d] p-4">
          <div className="text-xl font-bold">Update Product</div>

          <button
            onClick={closeProductUpdateModal}
            className="cursor-pointer focus:outline-none"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form
          onSubmit={(event) => updateProduct(event, id)}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4">
            <div className="relative">
              <select
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className="peer w-full cursor-pointer border-b border-[#1a1a1a] pr-4 focus:outline-none"
              >
                {categoryOptions(categories)}
              </select>

              <ChevronDown className="pointer-events-none absolute top-1/2 right-0 h-4 w-4 -translate-y-1/2 peer-open:hidden" />

              <ChevronUp className="pointer-events-none absolute top-1/2 right-0 hidden h-4 w-4 -translate-y-1/2 peer-open:block" />
            </div>

            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
              placeholder="Name"
              className="border-b border-[#1a1a1a] focus:outline-none"
            />

            <div className="flex gap-4">
              <input
                type="number"
                value={price}
                onChange={(event) => setPrice(event.target.value)}
                min={0}
                step={0.01}
                required
                placeholder="Price"
                className="min-w-0 flex-1 border-b border-[#1a1a1a] focus:outline-none"
              />

              <input
                type="number"
                value={discount}
                onChange={(event) => setDiscount(event.target.value)}
                min={0}
                max={100}
                step={1}
                required
                placeholder="Discount"
                className="min-w-0 flex-1 border-b border-[#1a1a1a] focus:outline-none"
              />

              <input
                type="text"
                value={currency}
                onChange={(event) => setCurrency(event.target.value)}
                required
                placeholder="Currency"
                className="min-w-0 flex-1 border-b border-[#1a1a1a] focus:outline-none"
              />
            </div>

            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={1}
              required
              placeholder="Description"
              className="shrink-0 border-b border-[#1a1a1a] focus:outline-none"
            />

            <div>
              <div className="flex items-center justify-between gap-4">
                <div className="font-bold">Images</div>

                <button
                  type="button"
                  onClick={addImage}
                  className="cursor-pointer focus:outline-none"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              <div className="flex flex-col gap-4">
                {images.map((image: any, index: number) =>
                  image.remove ? null : (
                    <div key={index} className="flex items-center gap-4">
                      <input
                        type="text"
                        value={image.url}
                        onChange={(event) =>
                          updateImage(index, event.target.value)
                        }
                        required
                        placeholder="URL"
                        className="w-full border-b border-[#1a1a1a] focus:outline-none"
                      />

                      {index > 0 && (
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="cursor-pointer focus:outline-none"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ),
                )}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between gap-4">
                <div className="font-bold">Specifications</div>

                <button
                  type="button"
                  onClick={addSpecification}
                  className="cursor-pointer focus:outline-none"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              <div className="flex flex-col gap-4">
                {specifications.map((specification: any, index: number) =>
                  specification.remove ? null : (
                    <div key={index} className="flex items-center gap-4">
                      <input
                        type="text"
                        value={specification.attribute}
                        onChange={(event) =>
                          updateSpecification(
                            index,
                            "attribute",
                            event.target.value,
                          )
                        }
                        required
                        placeholder="Attribute"
                        className="min-w-0 flex-1 border-b border-[#1a1a1a] focus:outline-none"
                      />

                      <input
                        type="text"
                        value={specification.value}
                        onChange={(event) =>
                          updateSpecification(
                            index,
                            "value",
                            event.target.value,
                          )
                        }
                        required
                        placeholder="Value"
                        className="min-w-0 flex-1 border-b border-[#1a1a1a] focus:outline-none"
                      />

                      {index > 0 && (
                        <button
                          type="button"
                          onClick={() => removeSpecification(index)}
                          className="cursor-pointer focus:outline-none"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ),
                )}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between gap-4">
                <div className="font-bold">Options</div>

                <button
                  type="button"
                  onClick={addOption}
                  className="cursor-pointer focus:outline-none"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              <div className="flex flex-col gap-4">
                <input
                  type="text"
                  value={options[0].attribute}
                  onChange={(event) =>
                    updateOption(0, "attribute", event.target.value)
                  }
                  required
                  placeholder="Attribute"
                  className="border-b border-[#1a1a1a] focus:outline-none"
                />

                {options.map((option: any, index: number) =>
                  option.remove ? null : (
                    <div key={index} className="flex items-center gap-4">
                      <input
                        type="text"
                        value={option.value}
                        onChange={(event) =>
                          updateOption(index, "value", event.target.value)
                        }
                        required
                        placeholder="Value"
                        className="min-w-0 flex-1 border-b border-[#1a1a1a] focus:outline-none"
                      />

                      <input
                        type="text"
                        value={option.sku}
                        onChange={(event) =>
                          updateOption(index, "sku", event.target.value)
                        }
                        required
                        placeholder="SKU"
                        className="min-w-0 flex-1 border-b border-[#1a1a1a] focus:outline-none"
                      />

                      <input
                        type="number"
                        value={option.stock}
                        onChange={(event) =>
                          updateOption(index, "stock", event.target.value)
                        }
                        min={0}
                        step={1}
                        required
                        placeholder="Stock"
                        className="min-w-0 flex-1 border-b border-[#1a1a1a] focus:outline-none"
                      />

                      {index > 0 && (
                        <button
                          type="button"
                          onClick={() => removeOption(index)}
                          className="cursor-pointer focus:outline-none"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ),
                )}
              </div>
            </div>

            <div>
              <div className="font-bold">Active</div>

              <button
                type="button"
                onClick={() => setActive(!active)}
                className="flex cursor-pointer items-center gap-1 focus:outline-none"
              >
                <div className="flex h-4 w-4 items-center border border-[#1a1a1a] bg-[#0d0d0d]">
                  {active && <Check className="h-4 w-4" />}
                </div>

                <div>Yes</div>
              </button>
            </div>
          </div>

          <div className="flex justify-center border-t border-[#1a1a1a] bg-[#0d0d0d] p-4">
            <button
              type="submit"
              className="flex cursor-pointer items-center gap-1 focus:outline-none"
            >
              <Check className="h-4 w-4" />

              <div>Submit</div>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
