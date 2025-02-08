use crate::{
    coords_from_file, idx_to_name, ACCENT_COLOR, BACKGROUND_COLOR, COORD_TYPES, TEXT_COLOR,
};
use anyhow::Context;
use plotters::{
    chart::ChartBuilder,
    prelude::{Circle, IntoDrawingArea, SVGBackend, Text},
    style::{IntoFont, ShapeStyle, TextStyle},
};

pub fn visualize() -> anyhow::Result<()> {
    for prefix in COORD_TYPES {
        let coord_space = coords_from_file(format!("{}_coordinates.csv", prefix))?;
        let fname_out = format!("{}_out.svg", prefix);

        let root = SVGBackend::new(&fname_out, (1920, 932)).into_drawing_area();
        root.fill(&BACKGROUND_COLOR)
            .context("Unable to fill drawing backend with color")?;

        let x_space = coord_space.max_x - coord_space.min_x;
        let y_space = coord_space.max_y - coord_space.min_y;

        let mut cc = ChartBuilder::on(&root).margin(30).build_cartesian_2d(
            coord_space.min_x..coord_space.max_x,
            coord_space.min_y..coord_space.max_y,
        )?;

        cc.configure_mesh()
            .disable_mesh()
            .draw()
            .context("Unable to draw to mesh.")?;

        let text_style = TextStyle::from(("sans-serif", 18).into_font()).color(&TEXT_COLOR);
        let circle_style = ShapeStyle {
            color: ACCENT_COLOR,
            filled: false,
            stroke_width: 3,
        };
        for (idx, (x, y)) in coord_space.coordinates.iter().enumerate() {
            let circle = Circle::new((*x, *y), 15, circle_style);
            cc.plotting_area().draw(&circle)?;
            let name = idx_to_name(&(idx as f64));
            let text = Text::new(name, (x + x_space / 90.0, y + y_space / 175.0), &text_style);
            cc.plotting_area().draw(&text)?;
        }

        root.present().context("Unable to write to svg")?;
    }

    Ok(())
}
